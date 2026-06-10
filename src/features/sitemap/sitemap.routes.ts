import { Router } from "express";
import { sitemapController } from "./sitemap.controller.js";

const router = Router();

router.get("/sitemap.xml", sitemapController.getSitemap);

export default router;