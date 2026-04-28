"use client";

import React from 'react';
import CurtaindesignNavbar from './CurtaindesignNavbar';
import CurtaindesignFooter from './CurtaindesignFooter';

export default function CurtaindesignPrivacy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-serif flex flex-col">
      <CurtaindesignNavbar />
      <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-6 w-full">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none font-sans text-slate-600">
          <p className="mb-4">Last updated: April 28, 2026</p>
          <p className="mb-6">
            At Curtaindesign.ai (operated by AIPyram GmbH, CH-8953 Dietikon, Switzerland), we take the privacy of your data seriously. 
            This Privacy Policy explains how we collect, use, and protect your information when you use our B2B textile design and 
            marketplace platform.
          </p>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Data Collection</h2>
          <p className="mb-6">
            We collect information you provide directly to us, such as when you create an account, upload 3D models, or 
            generate AI renderings. This may include your name, company details, email address, and uploaded intellectual property.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. AI Processing and Intellectual Property</h2>
          <p className="mb-6">
            Any fabric textures or 3D environments you upload for AI rendering are strictly processed for your explicit use. 
            AIPyram does not use your proprietary patterns to train public models. We adhere to the Swiss Federal Act on Data Protection (FADP) and GDPR.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Data Sharing</h2>
          <p className="mb-6">
            As a B2B platform, we may share your contact details with verified suppliers or manufacturers when you explicitly 
            request a quote or sample through the AIPyram Sovereign OS ecosystem.
          </p>
        </div>
      </main>
      <CurtaindesignFooter />
    </div>
  );
}
