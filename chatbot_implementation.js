// ============================================
// PRACTICAL EXAMPLE: AI CUSTOMER SERVICE CHATBOT
// For Car Workshop Appointment Booking
// ============================================

// This example uses OpenAI API + your workshop database
// Can be deployed as a web widget, WhatsApp bot, or SMS bot

const OpenAI = require('openai');
const mysql = require('mysql2/promise');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Database connection
const dbConfig = {
    host: 'localhost',
    user: 'workshop_user',
    password: 'your_password',
    database: 'car_workshop'
};

// ============================================
// CHATBOT SYSTEM PROMPT
// ============================================
const WORKSHOP_SYSTEM_PROMPT = `You are a helpful AI assistant for AutoFix Car Workshop.

WORKSHOP INFO:
- Location: 123 Main Street, Your City
- Hours: Monday-Saturday 8:00 AM - 6:00 PM, Closed Sundays
- Phone: (555) 123-4567

YOUR CAPABILITIES:
1. Answer questions about services and pricing
2. Check appointment availability
3. Book appointments (collect: name, phone, vehicle make/model, service needed, preferred date/time)
4. Provide general car maintenance advice
5. Explain our services

OUR SERVICES & PRICING:
- Oil Change: $45 (30 min)
- Tire Rotation: $35 (45 min)
- Brake Inspection: $50 (60 min)
- Brake Pad Replacement: $150 (2 hours)
- Battery Replacement: $120 (30 min)
- Full Vehicle Inspection: $80 (90 min)
- Engine Diagnostic: $75 (45 min)
- Minor Dent Repair: $200+ (3 hours)
- Headlight Replacement: $60 (30 min)

CONVERSATION STYLE:
- Friendly and professional
- Use simple language
- Ask clarifying questions when needed
- If booking appointment, collect all required info step by step
- For complex issues, suggest they call or visit in person

BOOKING PROCESS:
When customer wants to book:
1. Ask for their name
2. Ask for phone number
3. Ask for vehicle (make, model, year)
4. Ask what service they need
5. Check availability and suggest times
6. Confirm all details before finalizing

If you need to check availability or create an appointment, use the provided functions.`;

// ============================================
// DATABASE HELPER FUNCTIONS
// ============================================

async function checkAppointmentAvailability(date, duration = 60) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Get all appointments for the requested date
        const [appointments] = await connection.execute(`
            SELECT 
                appointment_date,
                duration,
                CONCAT(e.first_name, ' ', e.last_name) as mechanic_name
            FROM appointments a
            LEFT JOIN employees e ON a.assigned_mechanic_id = e.employee_id
            WHERE DATE(appointment_date) = DATE(?)
            AND status != 'Cancelled'
            ORDER BY appointment_date
        `, [date]);
        
        // Get available mechanics
        const [mechanics] = await connection.execute(`
            SELECT employee_id, CONCAT(first_name, ' ', last_name) as name
            FROM employees
            WHERE role = 'Mechanic' AND is_active = TRUE
        `);
        
        // Simple availability logic (8 AM - 6 PM, 1-hour slots)
        const workHours = [
            '08:00', '09:00', '10:00', '11:00', '12:00',
            '13:00', '14:00', '15:00', '16:00', '17:00'
        ];
        
        const bookedTimes = appointments.map(apt => {
            const time = new Date(apt.appointment_date);
            return time.toTimeString().slice(0, 5);
        });
        
        const availableSlots = workHours.filter(time => !bookedTimes.includes(time));
        
        return {
            date: date,
            availableSlots: availableSlots,
            mechanics: mechanics
        };
        
    } finally {
        await connection.end();
    }
}

async function createAppointment(appointmentData) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Start transaction
        await connection.beginTransaction();
        
        // Find or create customer
        let customerId;
        const [existingCustomer] = await connection.execute(
            'SELECT customer_id FROM customers WHERE phone = ?',
            [appointmentData.phone]
        );
        
        if (existingCustomer.length > 0) {
            customerId = existingCustomer[0].customer_id;
        } else {
            const [customerResult] = await connection.execute(
                'INSERT INTO customers (first_name, last_name, phone) VALUES (?, ?, ?)',
                [appointmentData.firstName, appointmentData.lastName, appointmentData.phone]
            );
            customerId = customerResult.insertId;
        }
        
        // Find or create vehicle
        let vehicleId;
        const [existingVehicle] = await connection.execute(
            'SELECT vehicle_id FROM vehicles WHERE customer_id = ? AND make = ? AND model = ?',
            [customerId, appointmentData.vehicleMake, appointmentData.vehicleModel]
        );
        
        if (existingVehicle.length > 0) {
            vehicleId = existingVehicle[0].vehicle_id;
        } else {
            const [vehicleResult] = await connection.execute(
                'INSERT INTO vehicles (customer_id, make, model, year) VALUES (?, ?, ?, ?)',
                [customerId, appointmentData.vehicleMake, appointmentData.vehicleModel, appointmentData.vehicleYear || new Date().getFullYear()]
            );
            vehicleId = vehicleResult.insertId;
        }
        
        // Get first available mechanic
        const [mechanics] = await connection.execute(
            'SELECT employee_id FROM employees WHERE role = "Mechanic" AND is_active = TRUE LIMIT 1'
        );
        const mechanicId = mechanics[0]?.employee_id;
        
        // Create appointment
        const [appointmentResult] = await connection.execute(`
            INSERT INTO appointments 
            (customer_id, vehicle_id, appointment_date, service_type, status, assigned_mechanic_id, notes)
            VALUES (?, ?, ?, ?, 'Scheduled', ?, ?)
        `, [
            customerId,
            vehicleId,
            appointmentData.appointmentDate,
            appointmentData.serviceType,
            mechanicId,
            `Booked via AI Chatbot. Customer message: ${appointmentData.notes || 'N/A'}`
        ]);
        
        await connection.commit();
        
        return {
            success: true,
            appointmentId: appointmentResult.insertId,
            customerId: customerId,
            vehicleId: vehicleId
        };
        
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        await connection.end();
    }
}

async function getServiceInfo(serviceName) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        const [services] = await connection.execute(`
            SELECT 
                s.service_name,
                s.description,
                s.estimated_duration,
                s.base_price,
                sc.category_name
            FROM services s
            LEFT JOIN service_categories sc ON s.category_id = sc.category_id
            WHERE s.service_name LIKE ? OR s.description LIKE ?
            LIMIT 5
        `, [`%${serviceName}%`, `%${serviceName}%`]);
        
        return services;
    } finally {
        await connection.end();
    }
}

// ============================================
// FUNCTION DEFINITIONS FOR AI
// ============================================

const functions = [
    {
        name: 'check_appointment_availability',
        description: 'Check available appointment slots for a specific date',
        parameters: {
            type: 'object',
            properties: {
                date: {
                    type: 'string',
                    description: 'Date to check availability (YYYY-MM-DD format)'
                },
                duration: {
                    type: 'number',
                    description: 'Estimated service duration in minutes (default: 60)'
                }
            },
            required: ['date']
        }
    },
    {
        name: 'create_appointment',
        description: 'Create a new appointment booking',
        parameters: {
            type: 'object',
            properties: {
                firstName: { type: 'string', description: 'Customer first name' },
                lastName: { type: 'string', description: 'Customer last name' },
                phone: { type: 'string', description: 'Customer phone number' },
                vehicleMake: { type: 'string', description: 'Vehicle make (e.g., Toyota, Honda)' },
                vehicleModel: { type: 'string', description: 'Vehicle model (e.g., Camry, Civic)' },
                vehicleYear: { type: 'number', description: 'Vehicle year' },
                serviceType: { type: 'string', description: 'Type of service requested' },
                appointmentDate: { type: 'string', description: 'Appointment date and time (YYYY-MM-DD HH:MM:SS)' },
                notes: { type: 'string', description: 'Additional notes or customer comments' }
            },
            required: ['firstName', 'lastName', 'phone', 'vehicleMake', 'vehicleModel', 'serviceType', 'appointmentDate']
        }
    },
    {
        name: 'get_service_info',
        description: 'Get information about available services',
        parameters: {
            type: 'object',
            properties: {
                serviceName: {
                    type: 'string',
                    description: 'Name or keywords for the service to look up'
                }
            },
            required: ['serviceName']
        }
    }
];

// ============================================
// MAIN CHATBOT FUNCTION
// ============================================

async function chatWithWorkshopBot(userMessage, conversationHistory = []) {
    try {
        // Build messages array
        const messages = [
            { role: 'system', content: WORKSHOP_SYSTEM_PROMPT },
            ...conversationHistory,
            { role: 'user', content: userMessage }
        ];
        
        // Call OpenAI with function calling
        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: messages,
            functions: functions,
            function_call: 'auto',
            temperature: 0.7,
            max_tokens: 500
        });
        
        const assistantMessage = response.choices[0].message;
        
        // Check if AI wants to call a function
        if (assistantMessage.function_call) {
            const functionName = assistantMessage.function_call.name;
            const functionArgs = JSON.parse(assistantMessage.function_call.arguments);
            
            console.log(`AI calling function: ${functionName}`, functionArgs);
            
            // Execute the appropriate function
            let functionResult;
            
            if (functionName === 'check_appointment_availability') {
                functionResult = await checkAppointmentAvailability(
                    functionArgs.date,
                    functionArgs.duration
                );
            } else if (functionName === 'create_appointment') {
                functionResult = await createAppointment(functionArgs);
            } else if (functionName === 'get_service_info') {
                functionResult = await getServiceInfo(functionArgs.serviceName);
            }
            
            // Send function result back to AI
            const followUpMessages = [
                ...messages,
                assistantMessage,
                {
                    role: 'function',
                    name: functionName,
                    content: JSON.stringify(functionResult)
                }
            ];
            
            const followUpResponse = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: followUpMessages,
                temperature: 0.7,
                max_tokens: 500
            });
            
            return {
                response: followUpResponse.choices[0].message.content,
                functionCalled: functionName,
                functionResult: functionResult
            };
        }
        
        // No function call, just return the response
        return {
            response: assistantMessage.content,
            functionCalled: null,
            functionResult: null
        };
        
    } catch (error) {
        console.error('Chatbot error:', error);
        return {
            response: "I apologize, but I'm having trouble right now. Please call us at (555) 123-4567 or visit our workshop directly.",
            error: error.message
        };
    }
}

// ============================================
// EXAMPLE USAGE
// ============================================

async function exampleConversation() {
    console.log('=== Car Workshop AI Chatbot Example ===\n');
    
    let conversationHistory = [];
    
    // Customer message 1
    let userMsg1 = "Hi, I need an oil change for my 2020 Toyota Camry";
    console.log(`Customer: ${userMsg1}`);
    
    let response1 = await chatWithWorkshopBot(userMsg1, conversationHistory);
    console.log(`Bot: ${response1.response}\n`);
    
    conversationHistory.push(
        { role: 'user', content: userMsg1 },
        { role: 'assistant', content: response1.response }
    );
    
    // Customer message 2
    let userMsg2 = "What days do you have available this week?";
    console.log(`Customer: ${userMsg2}`);
    
    let response2 = await chatWithWorkshopBot(userMsg2, conversationHistory);
    console.log(`Bot: ${response2.response}\n`);
    if (response2.functionCalled) {
        console.log(`[Function Called: ${response2.functionCalled}]`);
        console.log(`[Result: ${JSON.stringify(response2.functionResult, null, 2)}]\n`);
    }
    
    conversationHistory.push(
        { role: 'user', content: userMsg2 },
        { role: 'assistant', content: response2.response }
    );
    
    // Customer message 3
    let userMsg3 = "Great! Can you book me for tomorrow at 10 AM? My name is John Smith, phone is 555-0199";
    console.log(`Customer: ${userMsg3}`);
    
    let response3 = await chatWithWorkshopBot(userMsg3, conversationHistory);
    console.log(`Bot: ${response3.response}\n`);
    if (response3.functionCalled) {
        console.log(`[Function Called: ${response3.functionCalled}]`);
        console.log(`[Result: ${JSON.stringify(response3.functionResult, null, 2)}]\n`);
    }
}

// Run example (uncomment to test)
// exampleConversation();

// ============================================
// EXPRESS.JS API ENDPOINT (for web integration)
// ============================================

const express = require('express');
const app = express();
app.use(express.json());

// Store conversation sessions (in production, use Redis or database)
const sessions = new Map();

app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        // Get or create conversation history
        if (!sessions.has(sessionId)) {
            sessions.set(sessionId, []);
        }
        const conversationHistory = sessions.get(sessionId);
        
        // Get bot response
        const result = await chatWithWorkshopBot(message, conversationHistory);
        
        // Update conversation history
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: result.response }
        );
        
        // Keep only last 10 messages to manage token usage
        if (conversationHistory.length > 10) {
            conversationHistory.splice(0, conversationHistory.length - 10);
        }
        
        sessions.set(sessionId, conversationHistory);
        
        res.json({
            success: true,
            response: result.response,
            sessionId: sessionId
        });
        
    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Workshop chatbot API running on port ${PORT}`);
});

// ============================================
// WHATSAPP INTEGRATION (using Twilio)
// ============================================

const twilio = require('twilio');

app.post('/webhook/whatsapp', async (req, res) => {
    const incomingMessage = req.body.Body;
    const fromNumber = req.body.From;
    
    // Use phone number as session ID
    const sessionId = fromNumber;
    
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, []);
    }
    const conversationHistory = sessions.get(sessionId);
    
    // Get bot response
    const result = await chatWithWorkshopBot(incomingMessage, conversationHistory);
    
    // Update history
    conversationHistory.push(
        { role: 'user', content: incomingMessage },
        { role: 'assistant', content: result.response }
    );
    sessions.set(sessionId, conversationHistory);
    
    // Send response via WhatsApp
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(result.response);
    
    res.type('text/xml').send(twiml.toString());
});

module.exports = {
    chatWithWorkshopBot,
    checkAppointmentAvailability,
    createAppointment,
    getServiceInfo
};
