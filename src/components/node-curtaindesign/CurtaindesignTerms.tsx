"use client";

import React from 'react';
import CurtaindesignNavbar from './CurtaindesignNavbar';
import CurtaindesignFooter from './CurtaindesignFooter';

export default function CurtaindesignTerms() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-serif flex flex-col">
      <CurtaindesignNavbar />
      <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-6 w-full">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-slate max-w-none font-sans text-slate-600">
          <p className="mb-4">Last updated: April 28, 2026</p>
          <p className="mb-6">
            Welcome to Curtaindesign.ai, a B2B platform provided by aipyram GmbH ("we", "us", or "our"). 
            By accessing or using our AI-driven textile design and commerce platform, you agree to be bound by these Terms of Service.
          </p>
          
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. B2B Platform Usage</h2>
          <p className="mb-6">
            Curtaindesign.ai is exclusively for business-to-business (B2B) transactions. You represent that you are accessing 
            the platform on behalf of a registered business entity. Consumer rights directives do not apply to transactions 
            conducted on this platform.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. AI Renderings and Output</h2>
          <p className="mb-6">
            The 3D visualizations and AI-generated images provided by our platform are simulations. While we strive for 
            photorealism and accuracy, they should not replace physical samples for critical color or texture matching before 
            wholesale purchasing.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Global Transactions</h2>
          <p className="mb-6">
            Orders placed through the aipyram network are subject to international trade laws. aipyram GmbH acts as a technology 
            provider and smart escrow facilitator, but the underlying trade contract remains between the buyer and the manufacturer.
          </p>
        </div>
      </main>
      <CurtaindesignFooter />
    </div>
  );
}
