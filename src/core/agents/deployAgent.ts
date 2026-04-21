import { exec } from "child_process";
import fs from "fs";
import path from "path";
import projectsList from "../ide/projects.json";

export interface DeployResult {
    success: boolean;
    output: string;
    projectId?: string;
}

export class DeployAgent {
    static async deployProject(projectName: string): Promise<DeployResult> {
        return new Promise((resolve) => {
            try {
                // 1. Proje haritasını oku
                const projects = projectsList as any;

                const project = projects.find((p: any) => p.name.toLowerCase() === projectName.toLowerCase());

                if (!project) {
                    return resolve({ success: false, output: `${projectName} adlı proje projects.json içerisinde bulunamadı.` });
                }

                if (!fs.existsSync(project.repo)) {
                    return resolve({ success: false, output: `Proje kod yolu bulunamadı: ${project.repo}` });
                }

                console.log(`[🚀 DEPLOY] ${project.name} projesi buluta fırlatılıyor... (ID: ${project.projectId})`);

                // 2. Deployment çalıştır (Hedef klasöre girerek)
                const deployCommand = `npx firebase deploy --project ${project.projectId} --non-interactive`;
                
                const childProc = exec(deployCommand, { cwd: project.repo, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
                    if (error) {
                        return resolve({ 
                            success: false, 
                            output: `Firebase Deploy Hatası:\n${stderr || stdout || error.message}`,
                            projectId: project.projectId
                        });
                    }

                    return resolve({ 
                        success: true, 
                        output: `✅ ${project.name} Başarıyla Canlıya Alındı!\n\n${stdout.substring(stdout.length - 1000)}`,
                        projectId: project.projectId
                    });
                });

            } catch (err: any) {
                resolve({ success: false, output: `Deploy ajan çökmesi: ${err.message}` });
            }
        });
    }
}
