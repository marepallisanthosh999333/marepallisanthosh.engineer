import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSubmissionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      
      // Store the submission
      const submission = await storage.createContactSubmission(validatedData);
      
      // Here you would typically send an email
      // For now, we'll just log it and return success
      console.log("Contact form submission received:", submission);
      
      res.json({ 
        success: true, 
        message: "Thank you for your message! I'll get back to you soon.",
        id: submission.id 
      });
    } catch (error) {
      console.error("Contact form error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Invalid form data",
          details: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        error: "Failed to process your message. Please try again."
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
