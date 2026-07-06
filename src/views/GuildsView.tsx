/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  Radio, 
  ArrowLeft, 
  Sparkles, 
  ChevronRight, 
  Cpu, 
  BookOpen, 
  Ticket, 
  ShieldCheck, 
  Send,
  ThumbsUp,
  Award,
  Bell
} from 'lucide-react';
import { User, Product } from '../lib/db';

interface Guild {
  id: string;
  name: string;
  sellerName: string;
  logo: string;
  banner: string;
  category: string;
  membersCount: number;
  description: string;
  firmwareVersion?: string;
  exclusiveCode?: string;
  exclusiveDiscount?: number;
}

interface GuildPost {
  id: string;
  author: string;
  avatar: string;
  role: string;
  title: string;
  content: string;
  date: string;
  likes: number;
  comments: string[];
}

const initialGuilds: Guild[] = [
  {
    id: 'guild_aurasound',
    name: 'AuraSound Collective',
    sellerName: 'AuraSound Corp',
    logo: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=100&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
    category: 'Electronics',
    membersCount: 4208,
    description: 'The official interactive hub for AuraSound audio equipment owners. Share acoustics room maps, EQ presets, and stay updated on acoustic hardware developments.',
    firmwareVersion: 'v2.8.1-BETA',
    exclusiveCode: 'AURAGUILD15',
    exclusiveDiscount: 15
  },
  {
    id: 'guild_keycraft',
    name: 'KeyCraft Labs',
    sellerName: 'KeyCraft Industries',
    logo: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=100&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=80',
    category: 'Workspace',
    membersCount: 3105,
    description: 'Devoted to custom mechanical switches, substrate engineering, and desk setup layouts. Gain early access to group buying runs and layout files.',
    firmwareVersion: 'v1.4.9',
    exclusiveCode: 'KEYCRAFT20',
    exclusiveDiscount: 20
  },
  {
    id: 'guild_lumina',
    name: 'Lumina Design Hub',
    sellerName: 'Lumina Lighting',
    logo: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=100&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=1200&auto=format&fit=crop&q=80',
    category: 'Accessories',
    membersCount: 1892,
    description: 'Explore workspace ergonomics, circadian rhythm backlighting scripts, and color coordinate setups designed to boost cognitive performance.',
    firmwareVersion: 'v4.0.2',
    exclusiveCode: 'LUMINACLUB10',
    exclusiveDiscount: 10
  }
];

const initialPosts: Record<string, GuildPost[]> = {
  guild_aurasound: [
    {
      id: 'post_1',
      author: 'AuraSound Engineering Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
      role: 'Seller',
      title: '📢 Release Notes: Spatial Substrate firmware v2.8.1',
      content: 'We have committed the source files for firmware v2.8.1. This release solves an extreme frequency overlap issue when deploying our desk subs next to acoustic treatment panels. It also introduces a raw delay coefficient modifier.',
      date: '2026-07-02',
      likes: 84,
      comments: [
        'Fantastic! Solved my bass rattle instantly.',
        'Is this compatible with the original revision 1 board?'
      ]
    },
    {
      id: 'post_2',
      author: 'AcousticNerd99',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
      role: 'Buyer',
      title: 'Recommended EQ Profile for Glass Table Desks',
      content: 'For everyone experiencing standard table resonance around 140Hz, apply a -3.5dB notch filter. Glass tables behave as active sub-woofers, dampening the mids. This correction restored high-fidelity balances.',
      date: '2026-07-04',
      likes: 41,
      comments: [
        'Awesome tips, worked like magic!',
        'Saved my ears. I was about to return my studio monitors.'
      ]
    }
  ],
  guild_keycraft: [
    {
      id: 'post_3',
      author: 'KeyCraft Admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
      role: 'Seller',
      title: 'Group-Buy Update: KeyCraft Ergonomic Linear Switches',
      content: 'Production batches are 100% finished. The linear switches have been pre-lubed using Krytox 205g0 inside precision aluminum housings. Shipping is scheduled to lock in on Monday via priority courier hubs.',
      date: '2026-07-01',
      likes: 112,
      comments: [
        'My board is ready! Cant wait to solder these.',
        'Will there be extras available in the store?'
      ]
    }
  ],
  guild_lumina: [
    {
      id: 'post_4',
      author: 'Lumina Design Lead',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60',
      role: 'Seller',
      title: 'Firmware Update v4.0.2: Ambient Circadian Sleep Sync',
      content: 'This revision modifies the orange spectrum output at 10:00 PM to match sunset wavelengths in real-time based on local geolocation indices. Reduces blue spectrum noise to absolute zero for better sleep hygiene.',
      date: '2026-07-03',
      likes: 56,
      comments: [
        'I actually noticed my fatigue decreasing this week.',
        'Perfect integration!'
      ]
    }
  ]
};

interface GuildsViewProps {
  currentUser: User;
  onAddPromoCode: (promo: any) => void;
  setActiveView: (view: any) => void;
}

export default function GuildsView({ currentUser, onAddPromoCode, setActiveView }: GuildsViewProps) {
  const [selectedGuildId, setSelectedGuildId] = React.useState<string | null>(null);
  const [guilds, setGuilds] = React.useState<Guild[]>(() => {
    if (typeof window === 'undefined') return initialGuilds;
    const stored = localStorage.getItem('nexus_bazaar_guilds');
    return stored ? JSON.parse(stored) : initialGuilds;
  });

  const [posts, setPosts] = React.useState<Record<string, GuildPost[]>>(() => {
    if (typeof window === 'undefined') return initialPosts;
    const stored = localStorage.getItem('nexus_bazaar_guild_posts');
    return stored ? JSON.parse(stored) : initialPosts;
  });

  const [joinedGuilds, setJoinedGuilds] = React.useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('nexus_bazaar_joined_guilds');
    return stored ? JSON.parse(stored) : [];
  });

  // Discussion input states
  const [newPostTitle, setNewPostTitle] = React.useState('');
  const [newPostContent, setNewPostContent] = React.useState('');
  const [newPostError, setNewPostError] = React.useState<string | null>(null);
  const [commentInput, setCommentInput] = React.useState<Record<string, string>>({});

  const [unlockedCodes, setUnlockedCodes] = React.useState<string[]>([]);
  const [showNotification, setShowNotification] = React.useState<string | null>(null);

  // Persistence triggers
  React.useEffect(() => {
    localStorage.setItem('nexus_bazaar_guilds', JSON.stringify(guilds));
  }, [guilds]);

  React.useEffect(() => {
    localStorage.setItem('nexus_bazaar_guild_posts', JSON.stringify(posts));
  }, [posts]);

  React.useEffect(() => {
    localStorage.setItem('nexus_bazaar_joined_guilds', JSON.stringify(joinedGuilds));
  }, [joinedGuilds]);

  const activeGuild = guilds.find(g => g.id === selectedGuildId);
  const guildPosts = selectedGuildId ? (posts[selectedGuildId] || []) : [];

  const handleJoinGuild = (guildId: string) => {
    const isJoined = joinedGuilds.includes(guildId);
    let nextJoined: string[];
    if (isJoined) {
      nextJoined = joinedGuilds.filter(id => id !== guildId);
      // Decrement members count
      setGuilds(prev => prev.map(g => g.id === guildId ? { ...g, membersCount: g.membersCount - 1 } : g));
      triggerNotification(`You have left the ${guilds.find(g => g.id === guildId)?.name} Guild.`);
    } else {
      nextJoined = [...joinedGuilds, guildId];
      // Increment members count
      setGuilds(prev => prev.map(g => g.id === guildId ? { ...g, membersCount: g.membersCount + 1 } : g));
      triggerNotification(`Welcome! You joined the ${guilds.find(g => g.id === guildId)?.name} Guild.`);
    }
    setJoinedGuilds(nextJoined);
  };

  const triggerNotification = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleUnlockDiscount = (guild: Guild) => {
    if (!guild.exclusiveCode) return;
    
    if (unlockedCodes.includes(guild.exclusiveCode)) return;

    // Register code inside system registry promoCodes list
    onAddPromoCode({
      code: guild.exclusiveCode,
      discountPercent: guild.exclusiveDiscount || 10,
      description: `Exclusive member reward from ${guild.name}`,
      requiresElite: false
    });

    setUnlockedCodes(prev => [...prev, guild.exclusiveCode!]);
    triggerNotification(`Code ${guild.exclusiveCode} unlocked! Added to checkout vouchers.`);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuildId) return;

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setNewPostError('All fields are required.');
      return;
    }

    const newPost: GuildPost = {
      id: `post_${Date.now()}`,
      author: currentUser.name,
      avatar: currentUser.avatar,
      role: currentUser.role,
      title: newPostTitle,
      content: newPostContent,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: []
    };

    setPosts(prev => ({
      ...prev,
      [selectedGuildId]: [newPost, ...(prev[selectedGuildId] || [])]
    }));

    setNewPostTitle('');
    setNewPostContent('');
    setNewPostError(null);
    triggerNotification('Post published inside the Guild feed!');
  };

  const handleLikePost = (postId: string) => {
    if (!selectedGuildId) return;
    setPosts(prev => ({
      ...prev,
      [selectedGuildId]: (prev[selectedGuildId] || []).map(p => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      )
    }));
  };

  const handleAddComment = (postId: string) => {
    const text = commentInput[postId];
    if (!text || !text.trim() || !selectedGuildId) return;

    setPosts(prev => ({
      ...prev,
      [selectedGuildId]: (prev[selectedGuildId] || []).map(p => 
        p.id === postId ? { ...p, comments: [...p.comments, `${currentUser.name}: ${text}`] } : p
      )
    }));

    setCommentInput(prev => ({ ...prev, [postId]: '' }));
    triggerNotification('Comment posted.');
  };

  return (
    <div id="guilds-view-container" className="space-y-6 pb-16">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50 bg-slate-900 border border-teal-800 text-teal-400 font-mono text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <Bell className="h-4 w-4 animate-bounce text-teal-400" />
            <span>{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!activeGuild ? (
        <>
          {/* Main List view */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-mono font-bold text-teal-700">
                <Radio className="h-3 w-3 animate-pulse" />
                <span>Verified Brand Channels</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Seller-Hosted Community Guilds</h2>
              <p className="text-xs text-slate-400">Join merchant channels to interact, read official manuals, and claim member codes.</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guilds.map(guild => {
              const isJoined = joinedGuilds.includes(guild.id);
              return (
                <div 
                  id={`guild-card-${guild.id}`}
                  key={guild.id}
                  className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Banner */}
                    <div className="h-28 relative">
                      <img src={guild.banner} alt={guild.name} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"></div>
                      <span className="absolute bottom-2 left-3 text-[9px] font-mono font-bold uppercase tracking-wider bg-teal-600 text-white px-2 py-0.5 rounded-md">
                        {guild.category}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="p-5 space-y-3 relative">
                      {/* Logo float */}
                      <img 
                        src={guild.logo} 
                        alt={guild.name} 
                        className="h-12 w-12 rounded-2xl object-cover border-2 border-white absolute -top-8 right-5 shadow-md"
                      />
                      
                      <div className="leading-tight">
                        <h3 className="font-extrabold text-slate-900 text-base">{guild.name}</h3>
                        <p className="text-[10px] text-slate-400 font-mono">HOST: {guild.sellerName}</p>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {guild.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {guild.membersCount.toLocaleString()} Members
                    </span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJoinGuild(guild.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase cursor-pointer ${
                          isJoined 
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                            : 'bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100'
                        }`}
                      >
                        {isJoined ? 'Leave' : 'Join'}
                      </button>
                      
                      <button
                        onClick={() => setSelectedGuildId(guild.id)}
                        className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Enter Guild</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Detailed Guild Hub View */
        <div className="space-y-6">
          {/* Back Header */}
          <button
            onClick={() => setSelectedGuildId(null)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Guild Registry</span>
          </button>

          {/* Banner Hero */}
          <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-950 text-white relative h-48 sm:h-64 flex flex-col justify-end p-6 shadow-md">
            <img src={activeGuild.banner} alt={activeGuild.name} className="absolute inset-0 h-full w-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 w-full">
              <div className="flex items-center gap-4">
                <img src={activeGuild.logo} alt={activeGuild.name} className="h-16 w-16 rounded-2xl object-cover border-2 border-white shadow-xl bg-slate-800" />
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold tracking-widest bg-teal-500 text-slate-900 px-2 py-0.5 rounded uppercase">
                    {activeGuild.category} CHANNEL
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{activeGuild.name}</h2>
                  <p className="text-xs text-slate-300 font-mono">Owner/Vendor Verified: {activeGuild.sellerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleJoinGuild(activeGuild.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                    joinedGuilds.includes(activeGuild.id)
                      ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'
                      : 'bg-teal-600 text-white hover:bg-teal-500 shadow-md'
                  }`}
                >
                  {joinedGuilds.includes(activeGuild.id) ? '✓ Joined Member' : 'Join Community'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left: Feed & Forms (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Creator/Form */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-teal-600" />
                  Post in the Guild Discussion Forum
                </h3>
                
                <form onSubmit={handleCreatePost} className="space-y-3">
                  {newPostError && (
                    <p className="text-[10px] font-mono font-bold text-red-500">{newPostError}</p>
                  )}
                  <input
                    type="text"
                    placeholder="Enter short topic headline..."
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
                  />
                  <textarea
                    rows={3}
                    placeholder="Share logs, firmware setup questions, custom designs..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
                  ></textarea>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 text-white text-xs font-bold uppercase px-4 py-2 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" /> Publish Post
                    </button>
                  </div>
                </form>
              </div>

              {/* Feed List */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Active Community Post Logs ({guildPosts.length})</h4>
                
                {guildPosts.length > 0 ? (
                  guildPosts.map(post => (
                    <div id={`guild-post-${post.id}`} key={post.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={post.avatar} alt={post.author} className="h-8 w-8 rounded-full object-cover" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                              <span>{post.author}</span>
                              {post.role !== 'Buyer' && (
                                <span className="inline-flex items-center gap-0.5 bg-teal-50 text-teal-700 text-[8px] font-mono font-bold px-1.5 rounded-full border border-teal-100">
                                  <ShieldCheck className="h-2.5 w-2.5" /> OFFICIAL
                                </span>
                              )}
                            </p>
                            <p className="text-[9px] text-slate-400 font-mono">Date: {post.date} • {post.role}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleLikePost(post.id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-teal-600 bg-slate-50 px-2 py-1 rounded-lg hover:bg-teal-50 transition-all cursor-pointer"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>{post.likes}</span>
                        </button>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-900">{post.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      </div>

                      {/* Comments block */}
                      <div className="border-t border-slate-100 pt-3 space-y-2">
                        {post.comments.length > 0 && (
                          <div className="space-y-1.5 pl-3 border-l-2 border-slate-100">
                            {post.comments.map((comment, idx) => {
                              const [user, text] = comment.split(': ');
                              return (
                                <div key={idx} className="text-[11px] text-slate-600 leading-normal">
                                  <strong className="text-slate-800">{user}:</strong> {text}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentInput[post.id] || ''}
                            onChange={(e) => setCommentInput({ ...commentInput, [post.id]: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            className="flex-1 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs text-slate-800 outline-none focus:border-teal-500 focus:bg-white"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-800 cursor-pointer"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-xs">No posts inside this guild yet. Be the first to initiate a log thread!</p>
                )}
              </div>
            </div>

            {/* Right: Guild Specs & Rewards (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Guild Technical Details */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Cpu className="h-4.5 w-4.5 text-teal-600" />
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase">Hardware Tech Info</h4>
                </div>

                <div className="space-y-3 font-mono text-[10px] text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>Active Guild Level</span>
                    <span className="font-bold text-teal-600 flex items-center gap-0.5"><Award className="h-3 w-3" /> Lv.3 Channel</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Substrate Firmware</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{activeGuild.firmwareVersion || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Members Sync</span>
                    <span className="font-bold text-slate-900">{activeGuild.membersCount.toLocaleString()} connected</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Host Entity</span>
                    <span className="font-bold text-slate-900 text-right truncate max-w-[120px]">{activeGuild.sellerName}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 text-[11px] leading-relaxed text-slate-500 border border-slate-100">
                  <div className="flex gap-1.5">
                    <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>Guild updates are verified directly on hardware nodes. Check community manuals to audit schematics or download firmware files.</span>
                  </div>
                </div>
              </div>

              {/* Exclusive Reward Code */}
              {activeGuild.exclusiveCode && (
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-teal-950 p-5 shadow-lg text-white space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-teal-500/10 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
                    <Ticket className="h-4.5 w-4.5 text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Guild Member Perks</h4>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="font-extrabold text-sm text-slate-100">Unlock {activeGuild.exclusiveDiscount}% Store Credit Discount</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      All verified community members can instantly inject this voucher code into checkout to redeem exclusive savings on catalog items.
                    </p>
                  </div>

                  {unlockedCodes.includes(activeGuild.exclusiveCode) ? (
                    <div className="space-y-2">
                      <div className="w-full text-center bg-teal-950/80 border border-teal-500 rounded-xl py-2 font-mono font-black text-sm text-teal-400 tracking-wider shadow-inner animate-pulse">
                        {activeGuild.exclusiveCode}
                      </div>
                      <p className="text-[9px] text-center text-teal-500 font-mono">✓ Voucher linked to your account checkout registry</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUnlockDiscount(activeGuild)}
                      className="w-full h-10 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider hover:bg-amber-400 active:scale-98 transition-all shadow-md cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
                      <span>Unlock Guild Reward</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
