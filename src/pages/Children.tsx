import { useState } from "react";
import { ChildCard } from "@/components/ChildCard";
import { useStore } from "@/lib/store";
import { Plus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Children() {
  const { children, addChild } = useStore();
  const [open, setOpen] = useState(false); const [name, setName] = useState(""); const [age, setAge] = useState("");
  const submit = (e: React.FormEvent) => { e.preventDefault(); const parsed = Number(age); if (!name.trim() || !parsed || parsed < 1 || parsed > 17) return; addChild({ name: name.trim(), age: parsed }); setName(""); setAge(""); setOpen(false); toast.success(`${name.trim()} added to your family`); };
  return <div className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary"><Users className="h-4 w-4" /> Family profiles</div><h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Children</h1><p className="mt-1 text-muted-foreground">Manage profiles, safety scores and connected services.</p></div><Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Add child</Button></div>
    {open && <div className="rounded-2xl border bg-card p-5 shadow-card"><div className="flex items-center justify-between"><div><h2 className="font-display font-semibold">Add a child profile</h2><p className="text-sm text-muted-foreground">A new profile starts with a 100 safety score and no platforms.</p></div><button onClick={() => setOpen(false)} className="text-muted-foreground"><X className="h-5 w-5" /></button></div><form onSubmit={submit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end"><div className="space-y-2"><Label htmlFor="child-name">Name</Label><Input id="child-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" required /></div><div className="space-y-2"><Label htmlFor="child-age">Age</Label><Input id="child-age" type="number" min={1} max={17} value={age} onChange={(e) => setAge(e.target.value)} placeholder="12" required /></div><Button type="submit">Create profile</Button></form></div>}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{children.map((child) => <ChildCard key={child.id} child={child} />)}</div>
  </div>;
}
