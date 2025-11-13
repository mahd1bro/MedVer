import fastify from 'fastify';
import cors from '@fastify/cors';

const app = fastify({
  logger: true
});

// Enable CORS
app.register(cors, {
  origin: '*',
});

// Health check
app.get('/health', async (request, reply) => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
});

// Search medicines
app.get('/search', async (request, reply) => {
  const { q } = request.query as { q?: string };
  
  if (!q) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Query parameter "q" is required'
    });
  }

  // Mock medicine data
  const medicines = [
    {
      id: '1',
      name: 'Paracetamol 500mg',
      manufacturer: 'PharmaCorp Nigeria',
      regNo: 'A7-1234',
      category: 'Pain Relief'
    },
    {
      id: '2',
      name: 'Amoxicillin 250mg',
      manufacturer: 'HealthPharma Ltd',
      regNo: 'A7-5678',
      category: 'Antibiotic'
    }
  ];

  const results = medicines.filter(med => 
    med.name.toLowerCase().includes(q.toLowerCase())
  );

  return results;
});

// Verify medicine
app.post('/verify', async (request, reply) => {
  const { barcode, serialNumber, name } = request.body as any;

  if (!barcode && !serialNumber && !name) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'At least one of barcode, serialNumber, or name is required'
    });
  }

  // Mock verification
  const medicine = {
    id: '1',
    name: 'Paracetamol 500mg',
    manufacturer: 'PharmaCorp Nigeria',
    serialNumber: serialNumber || 'PM500MBN2024001',
    barcode: barcode || '123456789001',
    batchNumber: 'BTH2024001',
    expiryDate: '12/2026',
    nafdacNumber: 'A7-1234',
    isOriginal: true,
    description: 'Pain relief and fever reduction medication',
  };

  return {
    success: true,
    verified: true,
    product: medicine
  };
});

// Get all medicines
app.get('/medicines', async (request, reply) => {
  const medicines = [
    {
      id: '1',
      name: 'Paracetamol 500mg',
      manufacturer: 'PharmaCorp Nigeria',
      serialNumber: 'PM500MBN2024001',
      barcode: '123456789001',
      batchNumber: 'BTH2024001',
      expiryDate: '12/2026',
      nafdacNumber: 'A7-1234',
      isOriginal: true,
      description: 'Pain relief and fever reduction medication',
    },
    {
      id: '2',
      name: 'Amoxicillin 250mg',
      manufacturer: 'HealthPharma Ltd',
      serialNumber: 'AM250MBN2024002',
      barcode: '123456789002',
      batchNumber: 'BTH2024002',
      expiryDate: '06/2026',
      nafdacNumber: 'A7-5678',
      isOriginal: true,
      description: 'Antibiotic for bacterial infections',
    }
  ];

  return { success: true, data: medicines };
});

// Start server
const PORT = 3001;
const HOST = '0.0.0.0';

app.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`\n🚀 MedVerify Backend Server Running!`);
  console.log(`📡 Server URL: ${address}`);
  console.log(`📱 For mobile testing, use your PC's IP address\n`);
});
