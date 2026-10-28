"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Heart, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/data/site-config";
const links = [{href:"/",label:"Home"},{href:"/features",label:"Features"},{href:"/commands",label:"Commands"},{href:"/premium",label:"Premium"},{href:"/dashboard",label:"Dashboard"}];
export default function Navbar(){const path=usePathname();const [open,setOpen]=useState(false);return <header className="nav-wrap"><nav className="navbar shell" aria-label="Main navigation"><Link href="/" className="brand" onClick={()=>setOpen(false)}><span className="brand-mark"><img src={siteConfig.logo} alt="" /></span><span>shizuka<span className="brand-dot">.</span><small>DISCORD COMPANION</small></span></Link><div className={`nav-links ${open?'nav-open':''}`}>{links.map(l=><Link key={l.href} href={l.href} className={path===l.href?'active':''} onClick={()=>setOpen(false)}>{l.label}</Link>)}<a className="mobile-support" href={siteConfig.supportUrl || "/"} onClick={()=>setOpen(false)}>Support</a></div><div className="nav-actions"><a className="nav-support" href={siteConfig.supportUrl || "/"}>Support</a><a className="button button-pink button-small" href={siteConfig.inviteUrl || "/"}>Add to Discord <ArrowUpRight size={15}/></a><button className="menu-toggle" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div></nav></header>}
