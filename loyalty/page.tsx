'use client';

import React from 'react';
import { Star, Gift, Shield, Compass, Heart, ArrowRight, Award, Flame, Zap } from 'lucide-react';

export default function LoyaltyPage() {
  const [points, setPoints] = React.useState(1250);

  const quests = [
    {
      title: "Write a helpful review",
      reward: "+50 points",
      description: "Share your honest thoughts about your recent purchase to help other shoppers.",
      done: false,
    },
    {
      title: "Keep a 3-month auto-order streak",
      reward: "+200 points",
      description: "Keep your favorite items coming automatically and earn a streak bonus.",
      done: true,
    },
    {
      title: "Share your ideas on the board",
      reward: "+100 points",
      description: "Create a curated board of your favorite gears to inspire others.",
      done: false,
    },
    {
      title: "Complete a product setup quest",
      reward: "+150 points",
      description: "Buy a custom combined bundle and earn bonus points.",
      done: false,
    }
  ];

  return (
    <div id="loyalty-hub-page" className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <h1 id="loyalty-title" className="text-4xl font-black text-slate-900 tracking-tight">My Rewards & Fun Stuff</h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Welcome to your NexusBazaar rewards playground! Earn points, join fun quests, and get store cash to spend on your next favorite gear.
        </p>
      </div>

      {/* Points Counter */}
      <div className="bg-gradient-to-r from-teal-500 to-indigo-600 rounded-3xl p-8 text-white shadow-xl text-center space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-yellow-300">
          <Star className="h-10 w-10 fill-current" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wider uppercase opacity-95">Your Points</h2>
          <p className="text-5xl font-black mt-2">1,250 ⭐</p>
          <p className="text-lg text-emerald-100 font-medium mt-1">(Worth $12.50 in store cash!)</p>
        </div>
      </div>

      {/* Quests Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Award className="h-6 w-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-800">Your Fun Quests</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {quests.map((q, idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-slate-800 leading-tight">{q.title}</h4>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full shrink-0">
                    {q.reward}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{q.description}</p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                <span className={`text-[10px] font-mono font-bold uppercase ${q.done ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {q.done ? '✓ Completed' : '○ Active Quest'}
                </span>
                {!q.done && (
                  <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 cursor-pointer">
                    Let's Go <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
