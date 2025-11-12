import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite";
import { createDefaultAdmin } from "./createDefaultAdmin";
import { storage } from "./storage";
import paymentRoutes from "./routes/payment";
import receiptRoutes from "./routes/receipt";
import { validatePaymentConfig } from "./paymentConfig";
import { initializeStatsAndSchedules } from "./initializeData";
import { initializeBlogData } from "./initializeBlogData";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/payments', paymentRoutes);
app.use('/api/receipts', receiptRoutes);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Validate payment configuration for live mode
  const paymentValidation = validatePaymentConfig();
  if (!paymentValidation.isValid) {
    console.error('Payment configuration validation failed:');
    paymentValidation.errors.forEach(error => console.error(`- ${error}`));
    console.log('Note: Some payment features may not work without proper configuration');
  } else {
    console.log('✓ Payment system configured for LIVE PRODUCTION MODE');
  }
  
  // Database connection is handled by PostgreSQL automatically
  
  // Create a default admin user if one doesn't exist
  await createDefaultAdmin();
  
  // Initialize stats and schedules data
  await initializeStatsAndSchedules();
  
  // Initialize blog data
  await initializeBlogData();
  
  // Admin user creation is handled by createDefaultAdmin() function above
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Find an available port starting from 5000
  const findAvailablePort = async (startPort: number): Promise<number> => {
    const { createServer } = await import('net');
    return new Promise((resolve, reject) => {
      const testServer = createServer();
      testServer.listen(startPort, '0.0.0.0', () => {
        const address = testServer.address();
        const port = typeof address === 'object' && address !== null ? address.port : startPort;
        testServer.close(() => resolve(port));
      });
      testServer.on('error', async () => {
        try {
          const nextPort = await findAvailablePort(startPort + 1);
          resolve(nextPort);
        } catch (err) {
          reject(err);
        }
      });
    });
  };

  const port = process.env.PORT ? parseInt(process.env.PORT) : await findAvailablePort(8080);
  console.log(`Environment PORT: ${process.env.PORT}`);
  console.log(`Using port: ${port}`);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
