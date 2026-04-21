const fs = require('fs');
const routePath = 'c:/Users/MSI/Desktop/aipyramweb/src/app/api/aloha/chat/route.ts';
const content = fs.readFileSync(routePath, 'utf8');
const lines = content.split('\n');
const extracted = lines.slice(22, 1037).join('\n');

let engineContent = `import * as fs from 'fs';
import * as path from 'path';
import { adminDb } from '@/lib/firebase-admin';
import { executeMasterAgent, MasterSystemState } from '@/core/swarm/master-agent';
import { publishToTRTEX } from '@/core/swarm/publishers/trtex-publisher';
import { ActionRunner } from '@/core/execution/actionRunner';
import { Type } from '@google/genai';
import { alohaToolCache } from './toolCache';
import { alohaMemory } from './memory';

` + extracted;

engineContent = engineContent.replace('const tools: any[] =', 'export const tools: any[] =');
engineContent = engineContent.replace('const SYSTEM_PROMPT =', 'export const SYSTEM_PROMPT =');
engineContent = engineContent.replace('async function executeToolCall', 'export async function executeToolCall');

// define regex logic to inject caching into executeToolCall
const originalFuncStart = `export async function executeToolCall(call: { name?: string; args?: Record<string, any> | null }): Promise<string> {
  if (!call.name) return '[HATA] Tool ismi tanımsız';
  const args = (call.args || {}) as any;
  let toolResult = "";

  try {`;

const newFuncStart = `export async function executeToolCall(call: { name?: string; args?: Record<string, any> | null }): Promise<string> {
  if (!call.name) return '[HATA] Tool ismi tanımsız';
  const args = (call.args || {}) as any;
  let toolResult = "";

  const cachedResult = alohaToolCache.get(call.name, args);
  if (cachedResult) {
    return \`[⚡ CACHE HIT] Sonuçlar daha önce hesaplandı (5 dk geçerli):\\n\${cachedResult}\`;
  }

  try {`;

engineContent = engineContent.replace(originalFuncStart, newFuncStart);

const originalFuncEnd = `  return toolResult;
}`;

const newFuncEnd = `  if (!toolResult.includes('[TOOL HATA]') && !toolResult.includes('[HATA]')) {
    alohaToolCache.set(call.name || '', args, toolResult);
  }
  return toolResult;
}`;

engineContent = engineContent.replace(originalFuncEnd, newFuncEnd);

fs.writeFileSync('c:/Users/MSI/Desktop/aipyramweb/src/core/aloha/engine.ts', engineContent, 'utf8');
console.log('Fixed engine.ts!');
