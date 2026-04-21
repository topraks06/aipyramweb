"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
    Globe, Layers, ArrowRight, Building2, Briefcase, Stethoscope,
    Landmark, Plane, Zap, Mail, Search, ExternalLink, Truck, BarChart3, TrendingUp, Calendar,
    Car, Tv, Scale, ShoppingCart, PawPrint, MapPin, Building
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataCredibility, PieChart } from "@/components/ui/visual-intelligence";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

/* ═══════════════════════════════════════════════════════════════
   DOMAIN DATABASE — SOURCE: 270 domains Jan 2026
   18 brand-risk domains FILTERED (bkz: marka-riskli-domainler.md)
   ═══════════════════════════════════════════════════════════════ */

const SECTORS = [
    {
        id: "all", name: "All", icon: Layers, count: 0,
        domains: [] as { domain: string; desc: string; status: "live" | "building" | "planned" }[],
    },
    {
        id: "construction",
        name: "Construction & RE",
        icon: Building2,
        count: 0,
        domains: [
            { domain: "didimemlak.ai", desc: "Aegean coast smart real estate", status: "live" as const },
            { domain: "satilik.ai", desc: "AI real estate sales platform", status: "planned" as const },
            { domain: "immobiliens.ai", desc: "European real estate intelligence", status: "planned" as const },
            { domain: "remhome.ai", desc: "Remote home management", status: "planned" as const },
            { domain: "bauunternehmer.ai", desc: "Construction company AI", status: "planned" as const },
            { domain: "bauunternehmung.ai", desc: "Construction management AI", status: "planned" as const },
            { domain: "umbau.ai", desc: "Renovation AI assistant", status: "planned" as const },
            { domain: "fethiye.ai", desc: "Fethiye real estate", status: "planned" as const },
            { domain: "marmaris.ai", desc: "Marmaris real estate", status: "planned" as const },
            { domain: "kalkan.ai", desc: "Kalkan real estate", status: "planned" as const },
            { domain: "datca.ai", desc: "Datca real estate", status: "planned" as const },
            { domain: "girne.ai", desc: "North Cyprus real estate", status: "planned" as const },
            { domain: "kyrenia.ai", desc: "Kyrenia real estate platform", status: "planned" as const },
            { domain: "marina24.ai", desc: "Marina management AI", status: "planned" as const },
            { domain: "iskele.ai", desc: "Iskele real estate platform", status: "planned" as const },
            { domain: "aibauunternehmer.com", desc: "Construction company portal", status: "planned" as const },
            { domain: "aibauunternehmung.com", desc: "Construction management", status: "planned" as const },
            { domain: "aiimmo24.com", desc: "Real estate 24/7", status: "planned" as const },
            { domain: "aiinsaat.com", desc: "Construction AI", status: "planned" as const },
            { domain: "aikonut.com", desc: "Housing AI", status: "planned" as const },
            { domain: "aiumbau.com", desc: "Renovation", status: "planned" as const },
            { domain: "immo24ai.com", desc: "Real estate AI", status: "planned" as const },
            { domain: "aibodrum.com", desc: "Bodrum real estate", status: "planned" as const },
            { domain: "aididim.com", desc: "Didim platform", status: "planned" as const },
            { domain: "aifethiye.com", desc: "Fethiye platform", status: "planned" as const },
            { domain: "aimarmaris.com", desc: "Marmaris platform", status: "planned" as const },
            { domain: "aicesme.com", desc: "Cesme platform", status: "planned" as const },
            { domain: "aiekemer.com", desc: "Kemer platform", status: "planned" as const },
            { domain: "aikibris.com", desc: "Cyprus platform", status: "planned" as const },
            { domain: "aipamukkale.com", desc: "Pamukkale tourism", status: "planned" as const },
            { domain: "aiefes.com", desc: "Ephesus tourism", status: "planned" as const },
            { domain: "didimde.net", desc: "Didim guide", status: "planned" as const },
        ],
    },
    {
        id: "rental",
        name: "Global Rental",
        icon: Globe,
        count: 0,
        domains: [
            { domain: "rentworld.ai", desc: "Global rental network", status: "planned" as const },
            { domain: "ultrarent.ai", desc: "Premium rental", status: "planned" as const },
            { domain: "newyorkrent.ai", desc: "New York rental", status: "planned" as const },
            { domain: "parisrent.ai", desc: "Paris rental", status: "planned" as const },
            { domain: "londonrent.ai", desc: "London rental", status: "planned" as const },
            { domain: "dubairent.ai", desc: "Dubai rental", status: "planned" as const },
            { domain: "tokyorent.ai", desc: "Tokyo rental", status: "planned" as const },
            { domain: "singaporerent.ai", desc: "Singapore rental", status: "planned" as const },
            { domain: "hongkongrent.ai", desc: "Hong Kong rental", status: "planned" as const },
            { domain: "losangelesrent.ai", desc: "Los Angeles rental", status: "planned" as const },
            { domain: "istanbulrent.ai", desc: "Istanbul rental", status: "planned" as const },
            { domain: "chrent.ai", desc: "Switzerland rental", status: "planned" as const },
            { domain: "aichrent.com", desc: "Switzerland rental portal", status: "planned" as const },
            { domain: "didimrentacar.net", desc: "Didim car rental", status: "planned" as const },
        ],
    },
    {
        id: "automotive",
        name: "Automotive",
        icon: Car,
        count: 0,
        domains: [
            { domain: "taxi24.ai", desc: "24/7 taxi AI", status: "planned" as const },
            { domain: "filojet.ai", desc: "Fleet management AI", status: "planned" as const },
            { domain: "limousine24.ai", desc: "VIP transfer AI", status: "planned" as const },
            { domain: "limuzin.ai", desc: "Limousine platform", status: "planned" as const },
            { domain: "limuzin24.ai", desc: "24/7 limousine", status: "planned" as const },
            { domain: "dachtaxi.ai", desc: "DACH region taxi", status: "planned" as const },
            { domain: "araba24.ai", desc: "Car platform", status: "planned" as const },
            { domain: "arabatv.ai", desc: "Car TV", status: "planned" as const },
            { domain: "care24.ai", desc: "Vehicle maintenance AI", status: "planned" as const },
            { domain: "carstv.ai", desc: "Automobile TV", status: "planned" as const },
            { domain: "cartv.ai", desc: "Vehicle TV", status: "planned" as const },
            { domain: "caravan24.ai", desc: "Caravan platform", status: "planned" as const },
            { domain: "karavan24.ai", desc: "Caravan AI", status: "planned" as const },
            { domain: "aiaraba.com", desc: "AI car", status: "planned" as const },
            { domain: "aiarabam.com", desc: "AI my car", status: "planned" as const },
            { domain: "aikaravan.com", desc: "AI caravan", status: "planned" as const },
            { domain: "ailimuzin.com", desc: "AI limousine", status: "planned" as const },
            { domain: "ailimuzin24.com", desc: "AI limousine 24/7", status: "planned" as const },
            { domain: "limousine24ai.com", desc: "Limousine AI portal", status: "planned" as const },
            { domain: "ailimousine24.com", desc: "AI limousine transfer", status: "planned" as const },
            { domain: "aidachtaxi.com", desc: "DACH taxi", status: "planned" as const },
            { domain: "aihavataksi.com", desc: "Air taxi", status: "planned" as const },
            { domain: "aihavataxi.com", desc: "Air taxi EN", status: "planned" as const },
            { domain: "ailufttaxi.com", desc: "Air taxi DE", status: "planned" as const },
            { domain: "ailufttaxis.com", desc: "Air taxis DE", status: "planned" as const },
            { domain: "aiflyingtaxi.com", desc: "Flying taxi", status: "planned" as const },
            { domain: "aiucak.com", desc: "AI aircraft", status: "planned" as const },
        ],
    },
    {
        id: "aviation",
        name: "Aviation & Travel",
        icon: Plane,
        count: 0,
        domains: [
            /* lufthansaairlines.ai, sunexpress.ai, swissairlines.ai, luxair.ai → BANNED */
            { domain: "ajet.ai", desc: "Smart airline platform", status: "planned" as const },
            { domain: "flug24.ai", desc: "Flight search AI", status: "planned" as const },
            { domain: "flughafen.ai", desc: "Airport AI", status: "planned" as const },
            { domain: "havaalani.ai", desc: "Airport management", status: "planned" as const },
            { domain: "ucus24.ai", desc: "24/7 flight platform", status: "planned" as const },
            { domain: "tatilplani.ai", desc: "Holiday planning AI", status: "planned" as const },
            { domain: "GoHoliday.ai", desc: "Holiday AI platform", status: "planned" as const },
            { domain: "limousinair.ai", desc: "Airport transfer", status: "planned" as const },
            { domain: "taxiair.ai", desc: "Air taxi platform", status: "planned" as const },
            { domain: "aiucus.com", desc: "AI flight", status: "planned" as const },
            { domain: "aiucus24.com", desc: "AI flight 24/7", status: "planned" as const },
            { domain: "aiflughafen.com", desc: "AI airport", status: "planned" as const },
            { domain: "aiseyehat.com", desc: "AI travel", status: "planned" as const },
            { domain: "aiyolcu.com", desc: "AI passenger", status: "planned" as const },
            { domain: "aiyolcu24.com", desc: "AI passenger 24/7", status: "planned" as const },
        ],
    },
    {
        id: "energy",
        name: "Energy & Env.",
        icon: Zap,
        count: 0,
        domains: [
            { domain: "onlyenergy.ai", desc: "Energy optimization", status: "planned" as const },
            { domain: "energy24.ai", desc: "24/7 energy monitoring", status: "planned" as const },
            { domain: "euenergy.ai", desc: "European energy AI", status: "planned" as const },
            { domain: "euroenergy.ai", desc: "Euro energy platform", status: "planned" as const },
            { domain: "gunespaneli.ai", desc: "Solar panel AI", status: "planned" as const },
            { domain: "solarcollektor.ai", desc: "Solar collector AI", status: "planned" as const },
            { domain: "sonnenkollektor.ai", desc: "Solar collector", status: "planned" as const },
            { domain: "dewater.ai", desc: "Water treatment AI", status: "planned" as const },
            { domain: "aiecoenergy.com", desc: "Eco energy", status: "planned" as const },
            { domain: "aigunespaneli.com", desc: "AI solar panel", status: "planned" as const },
            { domain: "aisonnenkollektor.com", desc: "AI solar collector", status: "planned" as const },
            { domain: "aicleanwater.com", desc: "Clean water AI", status: "planned" as const },
        ],
    },
    {
        id: "textile",
        name: "Home Textile",
        icon: Briefcase,
        count: 0,
        domains: [
            /* creationbaumann.ai, zimmer-rohde.ai, silentgliss.ai, istikbal.ai, yatas.ai, delius.ai, hamotec.ai, mobiliar.ai → BANNED */
            { domain: "perde.ai", desc: "AI curtain design platform", status: "live" as const },
            { domain: "trtex.com", desc: "B2B textile marketplace", status: "building" as const },
            { domain: "hometex.ai", desc: "Home textile fair platform", status: "planned" as const },
            { domain: "heimtex.ai", desc: "DACH home textile solutions", status: "planned" as const },
            { domain: "heimtextil.ai", desc: "Heimtextil fair platform", status: "planned" as const },
            { domain: "heimtextilmesse.ai", desc: "Heimtextil fair AI", status: "planned" as const },
            { domain: "vorhang.ai", desc: "German curtain platform", status: "planned" as const },
            { domain: "vorhang24.ai", desc: "24/7 curtain service", status: "planned" as const },
            { domain: "vorhangonline.ai", desc: "Online curtain sales", status: "planned" as const },
            { domain: "curtaindesign.ai", desc: "Curtain design authority", status: "planned" as const },
            { domain: "mobilya.ai", desc: "Furniture AI platform", status: "planned" as const },
            { domain: "evtekstili.ai", desc: "Home textile platform", status: "planned" as const },
            { domain: "mobel.ai", desc: "Furniture design intelligence", status: "planned" as const },
            { domain: "icmimar.ai", desc: "Interior design AI", status: "planned" as const },
            { domain: "stardecor.ai", desc: "Decoration AI assistant", status: "planned" as const },
            { domain: "evdekor.ai", desc: "Home decoration AI", status: "planned" as const },
            { domain: "myvorhang.ai", desc: "Personal curtain assistant", status: "planned" as const },
            { domain: "alkapida.ai", desc: "Furniture platform", status: "planned" as const },
            { domain: "renevai.ai", desc: "Renewal AI", status: "planned" as const },
            { domain: "parda.ai", desc: "Curtain (multilingual)", status: "planned" as const },
            { domain: "krowat.ai", desc: "Bed AI (multilingual)", status: "planned" as const },
            { domain: "bezak.ai", desc: "Textile AI", status: "planned" as const },
            { domain: "perabot.ai", desc: "Furniture (multilingual)", status: "planned" as const },
            { domain: "kurtina.ai", desc: "Curtain (multilingual)", status: "planned" as const },
            { domain: "donoithat.ai", desc: "Interior design (multilingual)", status: "planned" as const },
            { domain: "shotry.ai", desc: "Curtain design (multilingual)", status: "planned" as const },
            { domain: "aiperde.com", desc: "AI curtain", status: "planned" as const },
            { domain: "aivorhang.com", desc: "AI curtain DE", status: "planned" as const },
            { domain: "aievdekor.com", desc: "AI home decor", status: "planned" as const },
            { domain: "aimobel.com", desc: "AI furniture DE", status: "planned" as const },
            { domain: "aimobilya.com", desc: "AI furniture TR", status: "planned" as const },
            { domain: "aievim.com", desc: "AI my home", status: "planned" as const },
            { domain: "aiyatak.com", desc: "AI bed", status: "planned" as const },
            { domain: "aigorden.com", desc: "AI curtain NL", status: "planned" as const },
            { domain: "aimebel.com", desc: "AI furniture RU", status: "planned" as const },
        ],
    },
    {
        id: "fintech",
        name: "Fintech",
        icon: Landmark,
        count: 0,
        domains: [
            /* altinyildiz.ai → BANNED */
            { domain: "autopayment.ai", desc: "Autonomous payment system", status: "planned" as const },
            { domain: "turkpay.ai", desc: "Turkish payment infra", status: "planned" as const },
            { domain: "goldborse.ai", desc: "Gold exchange intelligence", status: "planned" as const },
            { domain: "payturk.ai", desc: "Turkish payment platform", status: "planned" as const },
            { domain: "dachpay.ai", desc: "DACH payment solutions", status: "planned" as const },
            { domain: "dovizborsasi.ai", desc: "Forex exchange AI", status: "planned" as const },
            { domain: "kontopay.ai", desc: "Account payment AI", status: "planned" as const },
            { domain: "trpay.ai", desc: "TR payment system", status: "planned" as const },
            { domain: "tlpay.ai", desc: "TL payment system", status: "planned" as const },
            { domain: "chpay.ai", desc: "Swiss payment", status: "planned" as const },
            { domain: "frpay.ai", desc: "France payment", status: "planned" as const },
            { domain: "onlyaudit.ai", desc: "Audit AI", status: "planned" as const },
            { domain: "altinborsasi.ai", desc: "Gold exchange AI", status: "planned" as const },
            { domain: "aialtin.com", desc: "AI gold", status: "planned" as const },
            { domain: "aiborsa.com", desc: "AI exchange", status: "planned" as const },
            { domain: "aidachpay.com", desc: "DACH payment", status: "planned" as const },
            { domain: "aidoviz.com", desc: "AI forex", status: "planned" as const },
            { domain: "aikredi.com", desc: "AI credit", status: "planned" as const },
            { domain: "aikazan.com", desc: "AI earn", status: "planned" as const },
            { domain: "aifatura.com", desc: "AI invoice", status: "planned" as const },
            { domain: "aifiyat.com", desc: "AI price", status: "planned" as const },
            { domain: "aiverkaufen.com", desc: "AI sales DE", status: "planned" as const },
            { domain: "aivermietung.com", desc: "AI rental DE", status: "planned" as const },
        ],
    },
    {
        id: "health",
        name: "Health",
        icon: Stethoscope,
        count: 0,
        domains: [
            { domain: "spital.ai", desc: "Hospital AI solutions", status: "planned" as const },
            { domain: "spital24.ai", desc: "24/7 hospital AI", status: "planned" as const },
            { domain: "hospital24.ai", desc: "24/7 hospital platform", status: "planned" as const },
            { domain: "health24.ai", desc: "Health AI assistant", status: "planned" as const },
            { domain: "spitex.ai", desc: "Home care AI", status: "planned" as const },
            { domain: "spitex24.ai", desc: "24/7 home care", status: "planned" as const },
            { domain: "hastane24.ai", desc: "Hospital management AI", status: "planned" as const },
            { domain: "hospitai.ai", desc: "Hospital intelligence", status: "planned" as const },
            { domain: "medicare.ai", desc: "Health insurance AI", status: "planned" as const },
            { domain: "salomat.ai", desc: "Health AI (multilingual)", status: "planned" as const },
            { domain: "shifokar.ai", desc: "Doctor AI (multilingual)", status: "planned" as const },
            { domain: "aihasta.com", desc: "AI patient", status: "planned" as const },
            { domain: "aihastane.com", desc: "AI hospital", status: "planned" as const },
            { domain: "aihastane24.com", desc: "AI hospital 24/7", status: "planned" as const },
            { domain: "aispital.com", desc: "AI hospital DE", status: "planned" as const },
            { domain: "aispital24.com", desc: "AI hospital DE 24/7", status: "planned" as const },
            { domain: "aispitex.ai", desc: "AI home care", status: "planned" as const },
            { domain: "aispitex.com", desc: "AI home care portal", status: "planned" as const },
            { domain: "aispitex24.com", desc: "AI home care 24/7", status: "planned" as const },
            { domain: "healthai.com", desc: "Health AI", status: "planned" as const },
            { domain: "aidoktoru.com", desc: "AI doctor", status: "planned" as const },
            { domain: "aikalp.com", desc: "AI heart", status: "planned" as const },
            { domain: "aizahn.com", desc: "AI dental DE", status: "planned" as const },
        ],
    },
    {
        id: "media",
        name: "Media & TV",
        icon: Tv,
        count: 0,
        domains: [
            { domain: "bodrumtv.ai", desc: "Bodrum media", status: "planned" as const },
            { domain: "istanbultv.ai", desc: "Istanbul TV", status: "planned" as const },
            { domain: "antalyatv.ai", desc: "Antalya TV", status: "planned" as const },
            { domain: "izmirtv.ai", desc: "Izmir TV", status: "planned" as const },
            { domain: "berlintv.ai", desc: "Berlin TV", status: "planned" as const },
            { domain: "ankaratv.ai", desc: "Ankara TV", status: "planned" as const },
            { domain: "mersintv.ai", desc: "Mersin TV", status: "planned" as const },
            { domain: "trabzontv.ai", desc: "Trabzon TV", status: "planned" as const },
            { domain: "meclistv.ai", desc: "Parliament TV", status: "planned" as const },
            { domain: "reisetv.ai", desc: "Travel TV", status: "planned" as const },
        ],
    },
    {
        id: "lottery",
        name: "Lottery",
        icon: Landmark,
        count: 0,
        domains: [
            /* millipiyango.ai, sportoto.ai → BANNED */
            { domain: "eurolotto.ai", desc: "European lottery AI", status: "planned" as const },
            { domain: "swisslotto.ai", desc: "Swiss lottery AI", status: "planned" as const },
            { domain: "aiatyarisi.com", desc: "AI horse racing", status: "planned" as const },
            { domain: "aibahisci.com", desc: "AI betting", status: "planned" as const },
            { domain: "aitahmin.com", desc: "AI prediction", status: "planned" as const },
            { domain: "aiyaris.com", desc: "AI racing", status: "planned" as const },
            { domain: "aioyna.com", desc: "AI game", status: "planned" as const },
        ],
    },
    {
        id: "law",
        name: "Public & Law",
        icon: Scale,
        count: 0,
        domains: [
            /* tbmm.ai → BANNED */
            { domain: "adalet24.ai", desc: "24/7 legal AI", status: "planned" as const },
            { domain: "aiadalet.com", desc: "AI justice", status: "planned" as const },
            { domain: "aiadalet24.com", desc: "AI justice 24/7", status: "planned" as const },
            { domain: "aiavukat.com", desc: "AI lawyer", status: "planned" as const },
            { domain: "aibelge.com", desc: "AI document", status: "planned" as const },
            { domain: "aibilgi.com", desc: "AI info", status: "planned" as const },
            { domain: "aibelediye.com", desc: "AI municipality", status: "planned" as const },
        ],
    },
    {
        id: "ecommerce",
        name: "E-Commerce",
        icon: ShoppingCart,
        count: 0,
        domains: [
            /* yemeksepeti.ai, ciceksepeti.ai → BANNED */
            { domain: "dijitec.ai", desc: "Digital technology", status: "planned" as const },
            { domain: "fuar.ai", desc: "Fair AI platform", status: "planned" as const },
            { domain: "gozluk.ai", desc: "Eyewear AI", status: "planned" as const },
            { domain: "kulaklik.ai", desc: "Headphones AI", status: "planned" as const },
            { domain: "natel.ai", desc: "Phone AI", status: "planned" as const },
            { domain: "reparatur.ai", desc: "Repair AI", status: "planned" as const },
            { domain: "onlycargo.ai", desc: "Cargo intelligence", status: "planned" as const },
            { domain: "onlysecure.ai", desc: "Security AI", status: "planned" as const },
            { domain: "ikiz.ai", desc: "Digital twin platform", status: "planned" as const },
            { domain: "chgo.ai", desc: "Swiss Go platform", status: "planned" as const },
            { domain: "aidachgo.ai", desc: "DACH Go platform", status: "planned" as const },
            { domain: "aipazar.com", desc: "AI market", status: "planned" as const },
            { domain: "ainatel.com", desc: "AI phone", status: "planned" as const },
            { domain: "airecta.com", desc: "AI prescription", status: "planned" as const },
            { domain: "aireparatur.com", desc: "AI repair DE", status: "planned" as const },
            { domain: "aitamirat.com", desc: "AI repair", status: "planned" as const },
            { domain: "aiusta.com", desc: "AI craftsman", status: "planned" as const },
            { domain: "aiyemek.com", desc: "AI food", status: "planned" as const },
            { domain: "aiyeni.com", desc: "AI new", status: "planned" as const },
            { domain: "aibrille.com", desc: "AI eyewear DE", status: "planned" as const },
            { domain: "aibulur.com", desc: "AI finder", status: "planned" as const },
            { domain: "aieniyi.com", desc: "AI best", status: "planned" as const },
            { domain: "aiguvenlik.com", desc: "AI security", status: "planned" as const },
            { domain: "aikolay.com", desc: "AI easy", status: "planned" as const },
            { domain: "aikulak.com", desc: "AI ear", status: "planned" as const },
            { domain: "aikulaklik.com", desc: "AI headphones", status: "planned" as const },
            { domain: "aimakine.com", desc: "AI machine", status: "planned" as const },
            { domain: "airaparatur.com", desc: "AI repair portal", status: "planned" as const },
            { domain: "aiapollon.com", desc: "AI Apollon", status: "planned" as const },
            { domain: "aiaudion.com", desc: "AI audio", status: "planned" as const },
            { domain: "aibaloon.com", desc: "AI balloon", status: "planned" as const },
            { domain: "aibatarya.com", desc: "AI battery", status: "planned" as const },
            { domain: "aichgo.com", desc: "Swiss Go", status: "planned" as const },
            { domain: "aidachgo.com", desc: "DACH Go", status: "planned" as const },
            { domain: "aiuzay.com", desc: "AI space", status: "planned" as const },
        ],
    },
    {
        id: "pets",
        name: "Pets",
        icon: PawPrint,
        count: 0,
        domains: [
            { domain: "haustier.ai", desc: "Pet AI", status: "planned" as const },
            { domain: "pethotel.ai", desc: "Pet hotel AI", status: "planned" as const },
            { domain: "petotel.ai", desc: "Pet hotel TR", status: "planned" as const },
        ],
    },
    {
        id: "cities",
        name: "Cities",
        icon: MapPin,
        count: 0,
        domains: [
            { domain: "canakkale.ai", desc: "Canakkale AI", status: "planned" as const },
            { domain: "denizli.ai", desc: "Denizli AI", status: "planned" as const },
            { domain: "diyarbakir.ai", desc: "Diyarbakir AI", status: "planned" as const },
            { domain: "eskisehir.ai", desc: "Eskisehir AI", status: "planned" as const },
            { domain: "gaziantep.ai", desc: "Gaziantep AI", status: "planned" as const },
            { domain: "hatay.ai", desc: "Hatay AI", status: "planned" as const },
            { domain: "mardin.ai", desc: "Mardin AI", status: "planned" as const },
        ],
    },
    {
        id: "corporate",
        name: "Corporate",
        icon: Building,
        count: 0,
        domains: [
            { domain: "aipyram.com", desc: "Aipyram corporate", status: "live" as const },
        ],
    },
];

// Calculate counts for all sectors
SECTORS.forEach((s, i) => { if (i > 0) s.count = s.domains.length; });
SECTORS[0].count = SECTORS.slice(1).reduce((sum, s) => sum + s.count, 0);
SECTORS[0].domains = SECTORS.slice(1).flatMap(s => s.domains);

const STATUS_STYLE = {
    live: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    building: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    planned: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};
/* STATUS_LABEL moved inside component for i18n */

export default function DomainsPage() {
    const t = useTranslations("Domains");
    const [activeSector, setActiveSector] = useState("textile");
    const [searchQuery, setSearchQuery] = useState("");
    const STATUS_LABEL = { live: t("status_live"), building: t("status_building"), planned: t("status_planned") };
    const SECTOR_NAMES: Record<string, string> = {
        all: t("sec_all"), construction: t("sec_construction"), rental: t("sec_rental"),
        automotive: t("sec_automotive"), aviation: t("sec_aviation"), energy: t("sec_energy"),
        textile: t("sec_textile"), fintech: t("sec_fintech"), health: t("sec_health"),
        media: t("sec_media"), lottery: t("sec_lottery"), law: t("sec_law"),
        ecommerce: t("sec_ecommerce"), pets: t("sec_pets"), cities: t("sec_cities"),
        corporate: t("sec_corporate"),
    };

    const active = SECTORS.find(s => s.id === activeSector) || SECTORS[0];

    const filteredDomains = active.domains.filter(d =>
        d.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate .ai ratio
    const aiCount = SECTORS[0].domains.filter(d => d.domain.endsWith(".ai")).length;
    const aiRatio = Math.round((aiCount / SECTORS[0].count) * 100);

    return (
        <>
            <Header />
            <main className="min-h-screen pt-20">

                {/* Hero */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-background to-primary/[0.02]" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div>
                            <Badge variant="outline" className="mb-6 text-xs font-medium">
                                <Globe className="h-3 w-3 mr-1.5" />
                                {t("badge")}
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                                {t("title_1")} <span className="text-primary">{t("title_2")}</span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-8">
                                {t("description")}
                            </p>

                            {/* Search */}
                            <div className="relative max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder={t("search_placeholder")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Analytics Dashboard */}
                <section className="py-8 border-b">
                    <div className="container mx-auto px-4">
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="text-center p-4 corporate-card rounded-xl">
                                        <Globe className="h-4 w-4 text-primary mx-auto mb-1.5 opacity-60" />
                                        <div className="text-2xl font-bold text-primary">{SECTORS[0].count}</div>
                                        <div className="text-[10px] font-semibold text-foreground">{t("total_domains")}</div>
                                        <div className="text-[9px] font-bold text-emerald-600 mt-1">↑ 38% YoY</div>
                                    </div>
                                    <div className="text-center p-4 corporate-card rounded-xl">
                                        <BarChart3 className="h-4 w-4 text-primary mx-auto mb-1.5 opacity-60" />
                                        <div className="text-2xl font-bold text-primary">%{aiRatio}</div>
                                        <div className="text-[10px] font-semibold text-foreground">{t("ai_ratio")}</div>
                                        <div className="text-[9px] font-bold text-emerald-600 mt-1">↑ 15% YoY</div>
                                    </div>
                                    <div className="text-center p-4 corporate-card rounded-xl">
                                        <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1.5 opacity-60" />
                                        <div className="text-2xl font-bold text-primary">15</div>
                                        <div className="text-[10px] font-semibold text-foreground">{t("sectors_label")}</div>
                                        <div className="text-[9px] font-bold text-emerald-600 mt-1">↑ 3 New</div>
                                    </div>
                                    <div className="text-center p-4 corporate-card rounded-xl">
                                        <Calendar className="h-4 w-4 text-primary mx-auto mb-1.5 opacity-60" />
                                        <div className="text-2xl font-bold text-primary">2.8</div>
                                        <div className="text-[10px] font-semibold text-foreground">{t("avg_age")}</div>
                                        <div className="text-[9px] text-muted-foreground/60 mt-1">{t("portfolio_wide")}</div>
                                    </div>
                                </div>

                                <div className="hidden md:block">
                                    <PieChart
                                        size={120}
                                        centerLabel={t("chart_total")}
                                        data={[
                                            { label: t("chart_textile"), value: SECTORS.find(s => s.id === "textile")?.count || 0, color: "#DC2626" },
                                            { label: t("chart_realestate"), value: SECTORS.find(s => s.id === "construction")?.count || 0, color: "#EA580C" },
                                            { label: t("chart_ecommerce"), value: SECTORS.find(s => s.id === "ecommerce")?.count || 0, color: "#2563EB" },
                                            { label: t("chart_automotive"), value: SECTORS.find(s => s.id === "automotive")?.count || 0, color: "#7C3AED" },
                                            { label: t("chart_other"), value: (SECTORS[0].count || 0) - (SECTORS.find(s => s.id === "textile")?.count || 0) - (SECTORS.find(s => s.id === "construction")?.count || 0) - (SECTORS.find(s => s.id === "ecommerce")?.count || 0) - (SECTORS.find(s => s.id === "automotive")?.count || 0), color: "#94A3B8" },
                                        ]}
                                    />
                                </div>
                            </div>
                            <DataCredibility source="Domain Registry" updated="2026 Q1" confidence={98} className="mt-4 justify-center" />
                        </div>
                    </div>
                </section>

                {/* Sector Tabs + Domains */}
                <section className="py-12 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-wrap gap-2 mb-8">
                            {SECTORS.map(sector => {
                                const Icon = sector.icon;
                                const isActive = sector.id === activeSector;
                                return (
                                    <button
                                        key={sector.id}
                                        onClick={() => setActiveSector(sector.id)}
                                        className={`
                                            inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                            ${isActive
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border"
                                            }
                                        `}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="hidden sm:inline">{SECTOR_NAMES[sector.id] || sector.name}</span>
                                        <Badge variant={isActive ? "secondary" : "outline"} className="text-[10px] font-bold tabular-nums ml-1">
                                            {sector.count}
                                        </Badge>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">{filteredDomains.length}</strong> {t("showing")}
                                {searchQuery && ` · ${t("search_for")} "${searchQuery}"`}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredDomains.map((d, i) => (
                                <Card
                                    key={`${d.domain}-${i}`}
                                    className="corporate-card group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in"
                                    style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
                                >
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="p-2 bg-primary/8 rounded-lg group-hover:bg-primary/12 transition-colors">
                                                <Globe className="h-4 w-4 text-primary" />
                                            </div>
                                            <Badge variant="outline" className={`text-[9px] font-bold border ${STATUS_STYLE[d.status]}`}>
                                                {STATUS_LABEL[d.status]}
                                            </Badge>
                                        </div>
                                        <h3 className="font-mono text-base font-bold mb-1 group-hover:text-primary transition-colors">
                                            {d.domain}
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                            {d.desc}
                                        </p>
                                        <div className="flex gap-2">
                                            {d.status === "live" ? (
                                                <Button variant="default" size="sm" className="w-full text-xs" asChild>
                                                    <a href={`https://${d.domain}`} target="_blank" rel="noopener noreferrer">
                                                        {t("visit_platform")} <ExternalLink className="ml-1.5 h-3 w-3" />
                                                    </a>
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                                                    <Link href="/contact">
                                                        {t("interested")} <ArrowRight className="ml-1.5 h-3 w-3" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {filteredDomains.length === 0 && (
                            <div className="text-center py-16">
                                <Globe className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    {t("no_results")}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold mb-4">
                                {t("cta_title")}
                            </h2>
                            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                                {t("cta_desc")}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button size="lg" className="group" asChild>
                                    <a href="mailto:info@aipyram.com">
                                        <Mail className="mr-2 h-4 w-4" />
                                        info@aipyram.com
                                    </a>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/investor">
                                        {t("cta_investor")} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Legal Disclaimer */}
                <section className="py-8 border-t">
                    <div className="container mx-auto px-4">
                        <p className="text-[10px] text-muted-foreground/60 max-w-4xl mx-auto text-center leading-relaxed">
                            {t("disclaimer")} © {new Date().getFullYear()} Aipyram GmbH, Dietikon.
                        </p>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
