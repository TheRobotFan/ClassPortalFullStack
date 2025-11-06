import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Material as MaterialType } from "@/lib/actions/materials"

interface EditMaterialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material: MaterialType | null
  subjects: Array<{ id: string; name: string }>
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  uploading: boolean
}

export function EditMaterialDialog({
  open,
  onOpenChange,
  material,
  subjects,
  onSubmit,
  uploading
}: EditMaterialDialogProps) {
  if (!material) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica Materiale</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Titolo</Label>
            <Input
              id="edit-title"
              name="title"
              defaultValue={material.title}
              required
              placeholder="Es: Riassunto Fotosintesi"
            />
          </div>
          <div>
            <Label htmlFor="edit-description">Descrizione</Label>
            <Textarea
              id="edit-description"
              name="description"
              defaultValue={material.description || ""}
              placeholder="Breve descrizione del materiale..."
            />
          </div>
          <div>
            <Label htmlFor="edit-subject">Materia</Label>
            <Select name="subject" defaultValue={material.subject_id} required>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona materia" />
              </SelectTrigger>
              <SelectContent>
                {subjects
                  .filter((subject, index, self) => 
                    index === self.findIndex((s) => s.name === subject.name)
                  )
                  .map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-tags">Tag (separati da virgola)</Label>
            <Input
              id="edit-tags"
              name="tags"
              defaultValue={(material as any).tags?.join(', ') || ''}
              placeholder="es: formule, esami, ripasso"
            />
          </div>
          <div>
            <Label htmlFor="edit-is_public">Visibilità</Label>
            <Select name="is_public" defaultValue={material.is_public.toString()}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Pubblico</SelectItem>
                <SelectItem value="false">Privato</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button type="submit" disabled={uploading} className="flex-1">
              {uploading ? "Aggiornamento..." : "Aggiorna"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
