import * as fs from 'fs';
import * as path from 'path';
import { WorkerAgent } from './worker_agent';
import { ReviewerAgent, ValidationContext } from './reviewer_agent';

/**
 * ANTI-GRAVITY: MASTER AGENT (Hakan Toprak AI)
 * Sürüyü yöneten, işin doğasına göre uygun Skill dosyasını atayan ana akıl.
 */
export class MasterAgent {
  private worker: WorkerAgent;
  private reviewer: ReviewerAgent;

  constructor() {
    this.worker = new WorkerAgent();
    this.reviewer = new ReviewerAgent();
  }

  public determineSkillNeeded(taskDescription: string): string {
    // LLM'e sorarak karar mekanizması, mock:
    if (taskDescription.toLowerCase().includes('haber') || taskDescription.toLowerCase().includes('seo')) {
       return 'skill_news_writer';
    } else if (taskDescription.toLowerCase().includes('resim') || taskDescription.toLowerCase().includes('görsel')) {
       return 'skill_image_generator';
    }
    return 'skill_news_writer'; // Default
  }

  // Orchestration flow moves to execution_engine, Master just routes.
}
