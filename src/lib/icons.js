import { Droplet, HeartPulse, PartyPopper, Shield, Sparkles, Truck, Wrench, Zap } from "lucide-react";

const ICONS = { wrench: Wrench, sparkles: Sparkles, shield: Shield, heart: HeartPulse, party: PartyPopper, droplet: Droplet, truck: Truck, zap: Zap };
export const iconFor = (key) => ICONS[key] || Wrench;
