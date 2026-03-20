import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, UserCircle, Edit2, Users } from "lucide-react";
import { useAppState, type HouseholdMember } from "@/lib/store";

function MemberCard({ member, onEdit, onRemove }: {
  member: HouseholdMember;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const isSelf = member.relationship === "self";
  return (
    <Card className="p-4 border border-card-border" data-testid={`card-member-${member.id}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{member.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="h-4 text-[10px] capitalize">{member.relationship}</Badge>
              {member.age > 0 && <span className="text-[11px] text-muted-foreground">Age {member.age}</span>}
              {member.hasDisability && <Badge variant="outline" className="h-4 text-[10px]">Disability</Badge>}
              {member.isVeteran && <Badge variant="outline" className="h-4 text-[10px]">Veteran</Badge>}
            </div>
            {member.monthlyIncome > 0 && (
              <p className="text-[11px] text-muted-foreground mt-1">
                ${member.monthlyIncome.toLocaleString()}/mo income
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="w-7 h-7 p-0" onClick={onEdit} data-testid={`button-edit-${member.id}`}>
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          {!isSelf && (
            <Button variant="ghost" size="sm" className="w-7 h-7 p-0 text-destructive" onClick={onRemove} data-testid={`button-remove-${member.id}`}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function MemberForm({ member, onSave, onCancel }: {
  member?: HouseholdMember;
  onSave: (data: HouseholdMember) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(member?.name || "");
  const [relationship, setRelationship] = useState(member?.relationship || "child");
  const [age, setAge] = useState(member?.age?.toString() || "");
  const [hasDisability, setHasDisability] = useState(member?.hasDisability || false);
  const [isVeteran, setIsVeteran] = useState(member?.isVeteran || false);
  const [employmentStatus, setEmploymentStatus] = useState(member?.employmentStatus || "");
  const [monthlyIncome, setMonthlyIncome] = useState(member?.monthlyIncome?.toString() || "0");

  const handleSave = () => {
    onSave({
      id: member?.id || `member-${Date.now()}`,
      name: name || "Unnamed",
      relationship: relationship as HouseholdMember["relationship"],
      age: parseInt(age) || 0,
      hasDisability,
      isVeteran,
      employmentStatus,
      monthlyIncome: parseFloat(monthlyIncome) || 0,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-medium mb-1 block">Name</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane" className="h-9 text-sm" data-testid="input-member-name" />
      </div>
      <div>
        <Label className="text-xs font-medium mb-1 block">Relationship</Label>
        <Select value={relationship} onValueChange={v => setRelationship(v)}>
          <SelectTrigger className="h-9 text-sm" data-testid="select-relationship">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spouse">Spouse / Partner</SelectItem>
            <SelectItem value="child">Child</SelectItem>
            <SelectItem value="parent">Parent / Guardian</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs font-medium mb-1 block">Age</Label>
        <Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 10" className="h-9 text-sm max-w-[120px]" data-testid="input-member-age" />
      </div>
      <div>
        <Label className="text-xs font-medium mb-1 block">Monthly Income</Label>
        <div className="relative max-w-[160px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
          <Input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} className="h-9 text-sm pl-6" data-testid="input-member-income" />
        </div>
      </div>
      <div>
        <Label className="text-xs font-medium mb-1 block">Employment Status</Label>
        <Select value={employmentStatus} onValueChange={v => setEmploymentStatus(v)}>
          <SelectTrigger className="h-9 text-sm" data-testid="select-member-employment">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employed">Employed</SelectItem>
            <SelectItem value="unemployed">Unemployed</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
            <SelectItem value="child-na">N/A (Child)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Has a disability?</Label>
        <Switch checked={hasDisability} onCheckedChange={setHasDisability} data-testid="switch-member-disability" />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Military veteran?</Label>
        <Switch checked={isVeteran} onCheckedChange={setIsVeteran} data-testid="switch-member-veteran" />
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} className="flex-1 h-9 text-sm" data-testid="button-save-member">Save</Button>
        <Button variant="outline" onClick={onCancel} className="h-9 text-sm" data-testid="button-cancel-member">Cancel</Button>
      </div>
    </div>
  );
}

export default function HouseholdPage() {
  const { state, dispatch } = useAppState();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const members = state.user?.householdMembers || [];

  const totalIncome = members.reduce((sum, m) => sum + m.monthlyIncome, 0);
  const childCount = members.filter(m => m.relationship === "child").length;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Household Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your household to get more accurate benefit estimates.
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 h-8 text-xs" data-testid="button-add-member">
              <Plus className="w-3.5 h-3.5" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Add Household Member</DialogTitle>
            </DialogHeader>
            <MemberForm
              onSave={(data) => {
                dispatch({ type: "ADD_MEMBER", payload: data });
                setAddDialogOpen(false);
              }}
              onCancel={() => setAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 border border-card-border text-center">
          <Users className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold">{members.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Members</p>
        </Card>
        <Card className="p-3 border border-card-border text-center">
          <p className="text-lg font-bold">{childCount}</p>
          <p className="text-[10px] text-muted-foreground">Children</p>
        </Card>
        <Card className="p-3 border border-card-border text-center">
          <p className="text-lg font-bold">${totalIncome.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Monthly Income</p>
        </Card>
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {members.map(member => (
          editingId === member.id ? (
            <Card key={member.id} className="p-4 border border-primary/30">
              <p className="text-xs font-medium text-primary mb-3">Editing {member.name}</p>
              <MemberForm
                member={member}
                onSave={(data) => {
                  dispatch({ type: "UPDATE_MEMBER", payload: { id: member.id, data } });
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            </Card>
          ) : (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={() => setEditingId(member.id)}
              onRemove={() => dispatch({ type: "REMOVE_MEMBER", payload: member.id })}
            />
          )
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Adding household members helps us screen for programs specific to each person (e.g., CHIP for children, VA benefits for veterans).
        Income from all members is combined for household-level eligibility checks.
      </p>
    </div>
  );
}
