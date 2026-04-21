import fs from 'fs';
import path from 'path';
import { analyzeSite } from './siteAnalyzer';
import { scanProject } from './projectScanner';
import projectsList from './projects.json';

interface Project {
  name: string;
  projectId: string;
  url: string;
  repo: string;
}

export async function auditAllProjects() {
  const results = [];
  
  // Read projects from json
  let projects: Project[] = projectsList as Project[];

  try {
    for (const project of projects) {
    console.log(`[Commander] Auditing: ${project.name}`);
    
    const siteAnalysis = await analyzeSite(project.url);
    const repoAnalysis = scanProject(project.repo);

    let health = 'POOR';
    if (siteAnalysis.statusCode === 200 && siteAnalysis.hasTitle && repoAnalysis.exists) {
      health = 'GOOD';
    } else if (siteAnalysis.statusCode === 200) {
      health = 'WARNING (Missing Local Data or SEO)';
    }

    results.push({
      name: project.name,
      url: project.url,
      health,
      live_html_status: siteAnalysis,
      local_repo_status: repoAnalysis
    });
  }

  return { success: true, timestamp: Date.now(), total_projects: projects.length, results };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
