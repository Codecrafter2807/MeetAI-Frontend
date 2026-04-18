import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="mb-4">Your privacy is important to us. This policy explains how we handle your data.</p>
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Data We Collect</h2>
            <p className="mb-4">We collect meeting audio and transcripts solely to provide our AI services.</p>
            <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Data</h2>
            <p className="mb-4">Transcripts are processed to generate summaries and insights for you.</p>
        </div>
    );
}
