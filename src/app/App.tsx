import { RouterProvider } from 'react-router-dom';
import { Providers } from './providers';
import { router } from './router';
import { AuthBootstrap } from '@/features/auth/components/AuthBootstrap';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Navbar,
  Button,
  Card,
  Accordion,
  Badge,
  Divider,
  Link,
  Avatar,
  Tooltip,
  Spacer,
  NavbarBrand,
  NavbarItem,
  NavbarContent,
  AvatarGroup,
  AccordionItem,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

// ─────────────── Scroll animation hook (fixed ref type) ───────────────
const useScrollAnimation = (options = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px', ...options },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
};

// ─────────────── Animated section wrapper ───────────────
const AnimatedSection = ({
  children,
  className = '',
  delay = 0,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  [key: string]: any;
}) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-in-out`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// ─────────────── Device Sync Visual (Tailwind + custom CSS animations) ───────────────
// const DeviceSyncVisual = () => {
//   const devices = [
//     { type: 'phone', label: 'iPhone', icon: '📱', color: '#007AFF' },
//     { type: 'tablet', label: 'iPad', icon: '📋', color: '#5856D6' },
//     { type: 'laptop', label: 'Mac', icon: '💻', color: '#FF6B35' },
//     { type: 'desktop', label: 'Windows', icon: '🖥️', color: '#00A4EF' },
//   ];

//   return (
//     <div className="relative w-full max-w-[420px] h-[340px] mx-auto flex flex-col items-center justify-end">
//       {/* Cloud icon */}
//       <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
//         <div className="animate-cloud-float">
//           <svg width="100" height="70" viewBox="0 0 100 70" fill="none">
//             <ellipse
//               cx="50"
//               cy="50"
//               rx="42"
//               ry="20"
//               fill="#E8F0FE"
//               stroke="#006FEE"
//               strokeWidth="2"
//             />
//             <ellipse
//               cx="35"
//               cy="42"
//               rx="20"
//               ry="16"
//               fill="#E8F0FE"
//               stroke="#006FEE"
//               strokeWidth="2"
//             />
//             <ellipse
//               cx="62"
//               cy="38"
//               rx="22"
//               ry="18"
//               fill="#E8F0FE"
//               stroke="#006FEE"
//               strokeWidth="2"
//             />
//             <ellipse
//               cx="48"
//               cy="30"
//               rx="18"
//               ry="14"
//               fill="#D4E4FC"
//               stroke="#006FEE"
//               strokeWidth="2"
//             />
//           </svg>
//         </div>
//         <div className="absolute top-[15px] left-1/2 -translate-x-1/2 w-[90px] h-[60px] rounded-full bg-blue-500/10 animate-cloud-pulse"></div>
//         <p className="text-[0.7rem] font-bold text-blue-600 text-center mt-1">
//           CloudAccess
//         </p>
//       </div>

//       {/* Connection lines */}
//       <svg
//         className="absolute inset-0 w-full h-full pointer-events-none z-0"
//         viewBox="0 0 100 85"
//         preserveAspectRatio="none"
//       >
//         {devices.map((device) => (
//           <g key={device.type}>
//             <line
//               x1={device.x}
//               y1={device.y - 5}
//               x2={50}
//               y2={40}
//               stroke="#D4E4FC"
//               strokeWidth="1.5"
//               strokeDasharray="4 3"
//               opacity="0.7"
//             />
//           </g>
//         ))}
//       </svg>

//       {/* Devices */}
//       <div className="absolute bottom-0 z-10 flex gap-4 justify-center items-end flex-wrap px-2">
//         {devices.map((device, i) => (
//           <Tooltip key={device.type} content={device.label} placement="bottom">
//             <div
//               className="flex flex-col items-center gap-1.5 p-3 bg-white border-2 rounded-2xl shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg relative min-w-[60px] opacity-0 animate-device-enter"
//               style={{
//                 borderColor: device.color,
//                 animationDelay: `${i * 0.15}s`,
//               }}
//             >
//               <span className="text-2xl">{device.icon}</span>
//               <span className="text-[0.6rem] font-semibold text-gray-500 uppercase tracking-wider">
//                 {device.label}
//               </span>
//               <div
//                 className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-sync-blink"
//                 style={{ backgroundColor: device.color }}
//               ></div>
//             </div>
//           </Tooltip>
//         ))}
//       </div>

//       {/* Required keyframe styles */}
//       <style>{`
//         @keyframes cloudFloat { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-8px); } }
//         .animate-cloud-float { animation: cloudFloat 3s ease-in-out infinite; }
//         @keyframes cloudPulse { 0%,100%{ transform: translateX(-50%) scale(1); opacity:0.4; } 50%{ transform:translateX(-50%) scale(1.3); opacity:0; } }
//         .animate-cloud-pulse { animation: cloudPulse 2.5s ease-in-out infinite; }
//         @keyframes deviceEnter { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
//         .animate-device-enter { animation: deviceEnter 0.6s ease forwards; }
//         @keyframes syncBlink { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.3; transform:scale(1.8); } }
//         .animate-sync-blink { animation: syncBlink 1.2s ease-in-out infinite; }
//       `}</style>
//     </div>
//   );
// };

// ─── Animated Particle for Data Flow ───
const DataParticle = ({
  fromX,
  fromY,
  toX,
  toY,
  delay,
  color,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  delay: number;
  color: string;
}) => (
  <motion.circle
    r="3"
    fill={color}
    initial={{ cx: fromX, cy: fromY, opacity: 0 }}
    animate={{
      cx: [fromX, toX, fromX],
      cy: [fromY, toY, fromY],
      opacity: [0, 1, 1, 0],
    }}
    transition={{
      duration: 15,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

// ─── Device Card (animated) ───
const DeviceCard = ({
  icon,
  label,
  color,
  delay,
  connected,
}: {
  icon: string;
  label: string;
  color: string;
  delay: number;
  connected: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: 'easeOut' }}
    whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }}
    className="relative flex flex-col items-center gap-2 p-4 bg-white border-2 rounded-2xl shadow-sm cursor-pointer min-w-[80px]"
    style={{ borderColor: color + '40' }}
  >
    <Icon icon={icon} className="w-8 h-8" style={{ color }} />
    <span className="text-[0.65rem] font-semibold text-gray-500 uppercase tracking-wider">
      {label}
    </span>
    {connected && (
      <motion.div
        className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.7, 1], opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    )}
    {/* Sync indicator ring */}
    {connected && (
      <motion.div
        className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full"
        style={{ border: `2px solid ${color}` }}
        animate={{ scale: [1, 2], opacity: [0.6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
    )}
  </motion.div>
);

// ─── Main DeviceSyncVisual ───
const DeviceSyncVisual = () => {
  const devices = [
    { icon: 'mdi:cellphone', label: 'iPhone', color: '#007AFF' },
    { icon: 'mdi:tablet', label: 'iPad', color: '#5856D6' },
    { icon: 'mdi:laptop', label: 'MacBook', color: '#FF6B35' },
    { icon: 'mdi:monitor', label: 'Windows', color: '#00A4EF' },
  ];

  return (
    <div className="hidden md:flex relative w-full max-w-[500px] h-[380px] mx-auto flex-col items-center justify-end">
      {/* Cloud Center */}
      <motion.div
        className="absolute top-6 left-1/8 -translate-x-1/2 z-20 flex flex-col items-center"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative">
          <Icon icon="mdi:cloud" className="w-20 h-20 text-blue-600" />
          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-500/10"
            animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-400/10"
            animate={{ scale: [1, 1.8], opacity: [0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </div>
        <p className="text-xs font-bold text-blue-600 mt-1 tracking-wide">
          CLOUDACCESS
        </p>
        {/* Sync badge on cloud */}
        <motion.span
          className="text-[0.6rem] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ● SYNCING
        </motion.span>
      </motion.div>

      {/* SVG Data Flow Lines & Particles */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 500 380"
      >
        <defs>
          {devices.map((d, i) => (
            <linearGradient
              key={i}
              id={`lineGrad${i}`}
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor={d.color} stopOpacity="0.6" />
              <stop offset="100%" stopColor="#006FEE" stopOpacity="0.3" />
            </linearGradient>
          ))}
        </defs>

        {/* Connection lines */}
        {devices.map((d, i) => {
          const cx = 80 + i * 115; // device x center
          const cy = 290;
          const cloudX = 250;
          const cloudY = 70;
          return (
            <g key={i}>
              <motion.line
                x1={cx}
                y1={cy - 30}
                x2={cloudX}
                y2={cloudY + 30}
                stroke={`url(#lineGrad${i})`}
                strokeWidth="1.5"
                strokeDasharray="5 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{ delay: i * 0.3, duration: 1, ease: 'easeOut' }}
              />
              {/* Animated particles along the line */}
              <DataParticle
                fromX={cx}
                fromY={cy - 30}
                toX={cloudX}
                toY={cloudY + 30}
                delay={i * 0.4}
                color={d.color}
              />
              <DataParticle
                fromX={cx}
                fromY={cy - 30}
                toX={cloudX}
                toY={cloudY + 30}
                delay={i * 0.4 + 0.8}
                color={d.color}
              />
            </g>
          );
        })}

        {/* File icons floating up to cloud */}
        {[0, 1, 2, 3].map((i) => (
          <motion.g
            key={`file-${i}`}
            initial={{ opacity: 0, x: 80 + i * 115, y: 260 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: 80 + i * 115,
              y: [260, 150, 90],
            }}
            transition={{ duration: 3, delay: i * 0.8, repeat: Infinity }}
          >
            <rect
              x="-8"
              y="-8"
              width="16"
              height="20"
              rx="3"
              fill="white"
              stroke={devices[i].color}
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="3"
              textAnchor="middle"
              fontSize="7"
              fill={devices[i].color}
              fontWeight="bold"
            >
              CSV
            </text>
          </motion.g>
        ))}
      </svg>

      {/* Device Row */}
      <div className="absolute bottom-0 z-10 flex gap-4 justify-center items-end flex-wrap px-2 pb-4">
        {devices.map((device, i) => (
          <DeviceCard
            key={device.icon}
            icon={device.icon}
            label={device.label}
            color={device.color}
            delay={i * 0.15}
            connected={true}
          />
        ))}
      </div>
    </div>
  );
};

// ─────────────── Feature Card ───────────────
const FeatureCard = ({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className="transition-all duration-600 ease-in-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(25px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <Card
        isHoverable
        isPressable
        className="p-7 rounded-2xl border border-gray-100 shadow-sm h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-100"
      >
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-4">
          <Icon icon={icon} className="w-7 h-7 text-blue-600" />
        </div>
        <p className="text-lg font-bold text-gray-900 mb-2">{title}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </Card>
    </div>
  );
};

// ─────────────── How It Works Step ───────────────
const StepItem = ({
  step,
  icon,
  title,
  description,
  delay = 0,
}: {
  step: number;
  icon: string;
  title: string;
  description: string;
  delay?: number;
}) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className="flex gap-5 items-start transition-all duration-600 ease-in-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="min-w-[56px] h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/25">
        <Icon icon={icon} className="w-7 h-7 text-white" />
      </div>
      <div>
        <Badge
          color="primary"
          variant="flat"
          className="mb-1.5 font-semibold text-xs"
        >
          Step {step}
        </Badge>
        <p className="text-lg font-bold text-gray-900 mb-1.5">{title}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

// ─────────────── MAIN LANDING PAGE ───────────────
const MotionicsCloudAccessLanding = () => {
  const [scrolled, setScrolled] = useState(false);

  // Navbar scroll background effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const industries = [
    'Construction',
    'Mining',
    'Engineering',
    'Oil & Gas',
    'Automotive',
    'Manufacturing',
    'Aerospace',
    'Agriculture',
    'Transportation',
  ];

  const industryIcons: Record<string, string> = {
    Construction: 'lucide:hard-hat',
    Mining: 'lucide:pickaxe',
    Engineering: 'lucide:settings',
    'Oil & Gas': 'lucide:flame',
    Automotive: 'lucide:car',
    Manufacturing: 'lucide:factory',
    Aerospace: 'lucide:plane-takeoff',
    Agriculture: 'lucide:wheat',
    Transportation: 'lucide:truck',
  };

  const features = [
    {
      icon: 'mdi:cloud-check',
      title: 'Cloud Backup & Sync',
      description:
        'Securely store all sensor recordings, CSV files, reports, and attachments in AWS S3...',
    },
    {
      icon: 'mdi:cellphone-link',
      title: 'Multi-Device Access',
      description:
        'Access synchronized data from iPhone, iPad, Android, Windows, and Mac...',
    },
    {
      icon: 'mdi:account-group',
      title: 'Team Collaboration',
      description: 'Invite team members with role-based permissions...',
    },
    {
      icon: 'mdi:file-tree',
      title: 'Hierarchical Organization',
      description: 'Organize data into Plants → Machines → Tests...',
    },
    {
      icon: 'mdi:sync',
      title: 'Incremental Sync',
      description: 'Sync partial recordings while tests are still running...',
    },
    {
      icon: 'mdi:wifi-off',
      title: 'Offline-First Reliability',
      description: 'Sensors continue recording without internet...',
    },
  ];

  const faqItems = [
    {
      question: 'How does cloud synchronization work?',
      answer:
        'After completing a test in the Multi-Gauge app, tap "Sync to Cloud." The app authenticates with AWS Cognito, receives a secure S3 pre-signed URL, and uploads files directly to cloud storage. Metadata like folders, device info, and parsed readings are stored in our PostgreSQL database for instant browsing.',
    },
    {
      question: 'Can I access data from multiple devices?',
      answer:
        'Yes! Your cloud account links all devices running Motionics apps. Switch between your iPhone, iPad, Windows laptop, or Mac and see the same synced data structure — Plants, Machines, and Tests — across every device.',
    },
    {
      question: 'What happens if I lose internet during a test?',
      answer:
        'Nothing is lost. The platform uses an offline-first model. Your sensors keep recording locally, and synchronization retries automatically when connectivity is restored. Partial uploads are supported, and resumable transfers ensure large files complete successfully.',
    },
    {
      question: 'Is my industrial data secure?',
      answer:
        'Absolutely. All data is encrypted in transit (TLS) and at rest (AES-256) in AWS S3. Authentication uses AWS Cognito with multi-factor support. Role-based access ensures only authorized team members see your data.',
    },
    {
      question: 'Can I invite team members to my workspace?',
      answer:
        'Yes. Organization owners can invite members as Super Admin, Admin, or Viewer. Control access at the device or application level. Perfect for distributed teams, contractors, and enterprise departments.',
    },
    {
      question: 'Will other Motionics apps be supported?',
      answer:
        'Yes! Multi-Gauge is the first supported application. PileSense and future sensor-based apps will be integrated into the same cloud infrastructure, each maintaining isolated data structures under your unified account.',
    },
  ];

  return (
    <div className="bg-[#FAFBFC] min-h-screen">
      {/* ── Navbar ── */}
      <Navbar
        isBordered
        maxWidth="xl"
        className={`transition-all duration-350 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-sm'
            : 'bg-white shadow-none'
        }`}
        style={{ zIndex: 1000 }}
      >
        <NavbarBrand>
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Icon icon="mdi:cloud" className="w-9 h-9 text-blue-600" />
            <div>
              <p className="font-bold text-gray-900 text-base tracking-tight">
                Motionics
              </p>
              <p className="text-xs font-semibold text-blue-600 tracking-wide">
                CLOUDACCESS
              </p>
            </div>
          </div>
        </NavbarBrand>

        <NavbarContent justify="end" className="hidden sm:flex gap-6">
          <NavbarItem>
            <Link
              className="text-gray-900 font-medium text-sm cursor-pointer"
              onPress={() => scrollToSection('features')}
            >
              Features
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className="text-gray-900 font-medium text-sm cursor-pointer"
              onPress={() => scrollToSection('how-it-works')}
            >
              How It Works
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className="text-gray-900 font-medium text-sm cursor-pointer"
              onPress={() => scrollToSection('sync')}
            >
              Sync
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              className="text-gray-900 font-medium text-sm cursor-pointer"
              onPress={() => scrollToSection('faq')}
            >
              FAQ
            </Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Button
              variant="light"
              color="primary"
              size="sm"
              className="font-semibold text-sm"
            >
              Log In
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Button
              variant="shadow"
              color="primary"
              size="sm"
              className="font-semibold text-sm rounded-xl"
            >
              Create Free Account
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* ── Hero Section ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-10 items-center min-h-[75vh] py-10">
          {/* Left text */}
          <div>
            <AnimatedSection delay={0}>
              <Badge
                color="primary"
                className="mb-4 font-semibold px-3.5 py-1.5 rounded-full tracking-wide text-xs"
                content="🚀 Now Available for Multi-Gauge"
              >
                .
              </Badge>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight mb-2">
                All Your Sensor Data,{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                  Synced to the Cloud
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <p className="text-lg text-gray-500 leading-relaxed max-w-lg mb-7">
                Securely store, synchronize, and collaborate on industrial
                sensor data across all your devices. Eliminate local storage
                risks with centralized cloud backup for Multi-Gauge, PileSense,
                and the entire Motionics ecosystem.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={450}>
              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  color="primary"
                  size="lg"
                  className="font-bold text-base px-8 py-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:-translate-y-0.5 transition-all"
                >
                  Start Syncing Now — It's Free
                </Button>
                <Button
                  color="primary"
                  size="lg"
                  className="font-semibold text-base px-7 py-4 rounded-xl border-2 border-blue-100"
                  onClick={() => scrollToSection('how-it-works')}
                >
                  See How It Works →
                </Button>
              </div>
            </AnimatedSection>

            <Spacer y={2} />
            <AnimatedSection delay={600}>
              <div className="flex flex-wrap items-center gap-4">
                <AvatarGroup size="sm">
                  <Avatar src="https://i.pravatar.cc/40?img=1" />
                  <Avatar src="https://i.pravatar.cc/40?img=2" />
                  <Avatar src="https://i.pravatar.cc/40?img=3" />
                  <Avatar src="https://i.pravatar.cc/40?img=4" />
                </AvatarGroup>
                <span className="text-sm text-gray-500">
                  <strong className="text-gray-900">500+</strong> industrial
                  teams already syncing
                </span>
                <Divider orientation="vertical" className="h-5" />
                <span className="text-sm font-semibold text-green-500">
                  ● 99.9% Uptime
                </span>
              </div>
            </AnimatedSection>
          </div>

          {/* Right visual */}
          <AnimatedSection delay={200} className="flex justify-center">
            <DeviceSyncVisual />
          </AnimatedSection>
        </div>
      </main>

      <div className="">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-lg font-regular text-gray-600">
              Trusted by teams around the world
            </h2>
          </div>

          <div className="relative mt-6 overflow-hidden">
            {/* Edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

            <div className="group flex items-center gap-6">
              {/* Track A */}
              <div className="industryTrack flex min-w-full shrink-0 items-center gap-4 pr-4">
                {industries.map((name) => (
                  <div
                    key={`hero-a-${name}`}
                    className="relative flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-none"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                      <Icon
                        icon={industryIcons[name] ?? 'lucide:briefcase'}
                        className="text-xl text-primary"
                      />
                    </div>
                    <span className="whitespace-nowrap text-base font-regular text-black">
                      {name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Track B */}
              <div className="industryTrack flex min-w-full shrink-0 items-center gap-4 pr-4">
                {industries.map((name) => (
                  <div
                    key={`hero-b-${name}`}
                    className="relative flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <Icon
                        icon={industryIcons[name] ?? 'lucide:briefcase'}
                        className="text-xl text-primary"
                      />
                    </div>
                    <span className="whitespace-nowrap text-base font-semibold text-black">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <style>{`
        @keyframes industryMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .industryTrack {
          animation: industryMarquee 45s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .industryTrack { animation: none; }
        }
      `}</style>
          </div>
        </div>
      </div>

      <Spacer y={5} />

      {/* ── Features Section ── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <Badge
            color="primary"
            variant="flat"
            className="mb-3 font-semibold px-3.5 py-1.5 rounded-full text-xs"
          >
            Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-2">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
              Industrial Data Management
            </span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            From cloud backup to team collaboration — the complete platform for
            Motionics sensor data.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 100}
            />
          ))}
        </div>
      </section>

      <Spacer y={5} />

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        className="bg-white border-y border-gray-100 py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <Badge
              color="primary"
              variant="flat"
              className="mb-3 font-semibold px-3.5 py-1.5 rounded-full text-xs"
            >
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-2">
              Sync in{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            <StepItem
              step={1}
              icon="mdi:bluetooth-connect"
              title="Connect & Record"
              description="Connect your BLE sensors to Multi-Gauge on any device. Record readings continuously — timestamps, min, max, and current values — even offline."
              delay={0}
            />
            <StepItem
              step={2}
              icon="mdi:cloud-upload"
              title="Sync to Cloud"
              description="Tap 'Sync' in the app. Files upload securely via AWS S3 pre-signed URLs. Metadata is indexed for instant browsing across all your devices."
              delay={200}
            />
            <StepItem
              step={3}
              icon="mdi:devices"
              title="Access Anywhere"
              description="Browse your Plants, Machines, and Tests from any device. Share with team members, attach reports, and monitor data in near real-time."
              delay={400}
            />
          </div>
        </div>
      </section>

      <Spacer y={5} />

      {/* ── Incremental Sync Showcase ── */}
      <section id="sync" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <AnimatedSection>
            <DeviceSyncVisual />
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <Badge
              color="success"
              variant="flat"
              className="mb-3 font-semibold px-3.5 py-1.5 rounded-full text-xs bg-green-50 text-green-600"
            >
              ● Live Sync
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-3">
              Incremental Sync While{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                Tests Are Running
              </span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-5 text-lg">
              You don't have to wait until a test finishes. Sync partial
              recordings mid-test and continue collecting data. Additional
              readings sync incrementally — giving you near real-time cloud
              visibility without interrupting operations.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-800">
                <span className="text-green-500 text-lg">✓</span> Resumable
                uploads for large industrial datasets
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-800">
                <span className="text-green-500 text-lg">✓</span> Automatic
                retry on network failure
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-800">
                <span className="text-green-500 text-lg">✓</span> Offline-first:
                sensors keep recording without internet
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-800">
                <span className="text-green-500 text-lg">✓</span> AWS S3
                pre-signed URLs for secure direct uploads
              </li>
            </ul>
          </AnimatedSection>
        </div>
      </section>

      <Spacer y={5} />

      {/* ── Team Collaboration ── */}
      <section className="bg-white border-y border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
          <AnimatedSection>
            <Badge
              className="mb-3 font-semibold px-3.5 py-1.5 rounded-full text-xs bg-purple-50 text-purple-600"
              variant="flat"
            >
              👥 Team Workspaces
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-3">
              Collaborate with{' '}
              <span className="text-purple-600">Role-Based Access</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-5 text-lg">
              Invite team members to shared workspaces. Assign Super Admin,
              Admin, or Viewer roles. Control access per device or application.
              Perfect for distributed teams and enterprise departments.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge
                variant="flat"
                className="px-4 py-2 rounded-full font-semibold bg-orange-50 text-orange-600 text-xs"
              >
                Super Admin
              </Badge>
              <Badge
                variant="flat"
                className="px-4 py-2 rounded-full font-semibold bg-blue-50 text-blue-600 text-xs"
              >
                Admin
              </Badge>
              <Badge
                variant="flat"
                className="px-4 py-2 rounded-full font-semibold bg-green-50 text-green-600 text-xs"
              >
                Viewer
              </Badge>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <Card className="p-6 rounded-2xl border border-gray-100 shadow-md">
              <p className="text-lg font-bold text-gray-900 mb-4">
                🏭 Organization Structure
              </p>
              <div className="space-y-2">
                {[
                  {
                    level: 'Plant',
                    desc: 'Top-level facility or site',
                    color: '#006FEE',
                  },
                  {
                    level: 'Machine',
                    desc: 'Equipment within a plant',
                    color: '#0090FF',
                  },
                  {
                    level: 'Test',
                    desc: 'Sensor recording sessions',
                    color: '#17C964',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border-l-4 transition-all duration-300 hover:bg-blue-50 hover:translate-x-1"
                    style={{ borderLeftColor: item.color }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
                      style={{
                        backgroundColor: `${item.color}18`,
                        color: item.color,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {item.level}
                      </p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Spacer y={0.5} />
              <p className="text-xs text-gray-500 text-center">
                Attach images, PDFs, notes & metadata at any level
              </p>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      <Spacer y={5} />

      {/* ── CTA Banner ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-500 p-10 sm:p-14 text-center shadow-2xl shadow-blue-500/30 overflow-hidden">
            <div className="absolute inset-0 bg polka-dots opacity-10 rounded-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
                Ready to Secure Your Sensor Data?
              </h2>
              <p className="text-white/80 max-w-lg mx-auto mb-7 leading-relaxed text-lg">
                Join hundreds of industrial teams already syncing their
                Motionics data to the cloud. Start with a free account — no
                credit card required.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  className="font-bold text-base px-9 py-4 rounded-xl bg-white text-blue-600 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all"
                >
                  Create Free Account 🚀
                </Button>
                <Button
                  size="lg"
                  className="font-semibold text-base px-8 py-4 rounded-xl border-2 border-white/50 text-white bg-transparent hover:bg-white/10"
                >
                  Schedule a Demo
                </Button>
              </div>
              <Spacer y={1} />
              <p className="text-white/60 text-sm">
                Works with Multi-Gauge • iOS • Android • Windows • macOS •
                iPadOS
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>

      <Spacer y={5} />

      {/* ── FAQ Accordion ── */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-10">
          <Badge
            color="primary"
            variant="flat"
            className="mb-3 font-semibold px-3.5 py-1.5 rounded-full text-xs"
          >
            FAQ
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Got Questions?{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
              We've Got Answers
            </span>
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <Accordion
            variant="splitted"
            className="rounded-2xl border border-gray-100"
          >
            {faqItems.map((item, idx) => (
              <AccordionItem
                key={idx}
                title={
                  <span className="font-bold text-gray-900 text-sm">
                    {item.question}
                  </span>
                }
                className="border-b border-gray-100 last:border-b-0 py-1"
              >
                <p className="text-gray-500 leading-relaxed py-2 text-sm">
                  {item.answer}
                </p>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </section>

      <Spacer y={5} />

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-lg shadow-lg shadow-blue-500/30">
                  ☁️
                </div>
                <div>
                  <p className="font-bold text-gray-900">Motionics</p>
                  <p className="text-xs font-semibold text-blue-600 tracking-wide">
                    CLOUDACCESS
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                The centralized cloud platform for all Motionics industrial
                sensor data. Secure backup, multi-device sync, and team
                collaboration.
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-3 text-sm">Platform</p>
              <ul className="space-y-2">
                {[
                  'Features',
                  'How It Works',
                  'Sync',
                  'Security',
                  'Pricing',
                ].map((item) => (
                  <li key={item}>
                    <Link
                      className="text-sm text-gray-500 cursor-pointer hover:text-blue-600"
                      onClick={() =>
                        scrollToSection(item.toLowerCase().replace(/\s/g, '-'))
                      }
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-3 text-sm">Resources</p>
              <ul className="space-y-2">
                {[
                  'Documentation',
                  'API Reference',
                  'Blog',
                  'Support',
                  'Status',
                ].map((item) => (
                  <li key={item}>
                    <Link className="text-sm text-gray-500 cursor-pointer hover:text-blue-600">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-3 text-sm">
                Stay Updated
              </p>
              <p className="text-sm text-gray-500 mb-3">
                Get the latest on new features and app integrations.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-600 transition-colors"
                />
                <Button
                  color="primary"
                  size="sm"
                  className="rounded-xl font-semibold"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          <Spacer y={2} />
          <Divider />
          <Spacer y={1.5} />

          <div className="flex flex-wrap justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2026 Motionics. All rights reserved. CloudAccess Platform.
            </p>
            <div className="flex gap-4">
              <Link className="text-sm text-gray-500 cursor-pointer">
                Privacy Policy
              </Link>
              <Link className="text-sm text-gray-500 cursor-pointer">
                Terms of Service
              </Link>
              <Link className="text-sm text-gray-500 cursor-pointer">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile bottom CTA (shown on small screens) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 z-50 shadow-2xl md:hidden">
        <Button
          color="primary"
          size="md"
          className="w-full font-bold rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg shadow-blue-500/40"
        >
          Start Syncing Now — It's Free 🚀
        </Button>
      </div>
    </div>
  );
};

export function App() {
  return (
    <Providers>
      <AuthBootstrap />
      <RouterProvider router={router} />
      {/* <MotionicsCloudAccessLanding /> */}
    </Providers>
  );
}
