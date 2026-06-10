import type { Request, Response, NextFunction } from "express";
import { sitemapService } from "./sitemap.service.js";

export const sitemapController = {
  async getSitemap(req: Request, res: Response, next: NextFunction) {
    try {
      const baseUrl = process.env.FRONTEND_URL!;
      const xml = await sitemapService.generate(baseUrl);

      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      next(error);
    }
  },
};