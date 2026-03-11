"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Edit3 } from "lucide-react";
import { useAdminStore, HeroSlide, PromoBanner, SocialLinks } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function HomepageSettingsPage() {
  const slides = useAdminStore((s) => s.heroSlides);
  const addHeroSlide = useAdminStore((s) => s.addHeroSlide);
  const updateHeroSlide = useAdminStore((s) => s.updateHeroSlide);
  const deleteHeroSlide = useAdminStore((s) => s.deleteHeroSlide);
  const promo = useAdminStore((s) => s.promoBanner);
  const updatePromo = useAdminStore((s) => s.updatePromoBanner);
  const social = useAdminStore((s) => s.socialLinks);
  const updateSocial = useAdminStore((s) => s.updateSocialLinks);

  const [activeTab, setActiveTab] = useState("hero");

  const emptySlide: HeroSlide = {
    id: "",
    badge: "",
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    image: "",
  };
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [slideForm, setSlideForm] = useState<HeroSlide>(emptySlide);
  const [promoForm, setPromoForm] = useState<PromoBanner>(promo);
  const [socialForm, setSocialForm] = useState<SocialLinks>(social);

  const resetSlideForm = () => {
    setSlideForm(emptySlide);
    setEditingSlide(null);
  };

  const handleSlideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlide) {
      updateHeroSlide(slideForm);
    } else {
      addHeroSlide({ ...slideForm, id: Date.now().toString() });
    }
    resetSlideForm();
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePromo(promoForm);
  };

  const handleSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSocial(socialForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Homepage Settings</h1>
          <p className="text-muted-foreground">Manage homepage content</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="hero">Hero Slides</TabsTrigger>
          <TabsTrigger value="promo">Promo Banner</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Existing Slides</CardTitle>
              <CardDescription>Manage homepage hero slides</CardDescription>
            </CardHeader>
            <CardContent>
              {slides.length === 0 ? (
                <p className="text-muted-foreground">No slides added yet</p>
              ) : (
                <div className="space-y-4">
                  {slides.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{s.title || "(no title)"}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.badge}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingSlide(s);
                            setSlideForm(s);
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteHeroSlide(s.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <form onSubmit={handleSlideSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingSlide ? "Edit Slide" : "Add New Slide"}
                </CardTitle>
                <CardDescription>
                  Each slide should include image, text and link
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Badge"
                  value={slideForm.badge}
                  onChange={(e) =>
                    setSlideForm({ ...slideForm, badge: e.target.value })
                  }
                />
                <Input
                  placeholder="Title"
                  value={slideForm.title}
                  onChange={(e) =>
                    setSlideForm({ ...slideForm, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Description"
                  rows={2}
                  value={slideForm.description}
                  onChange={(e) =>
                    setSlideForm({ ...slideForm, description: e.target.value })
                  }
                />
                <Input
                  placeholder="Button Text"
                  value={slideForm.buttonText}
                  onChange={(e) =>
                    setSlideForm({ ...slideForm, buttonText: e.target.value })
                  }
                />
                <Input
                  placeholder="Button Link"
                  value={slideForm.buttonLink}
                  onChange={(e) =>
                    setSlideForm({ ...slideForm, buttonLink: e.target.value })
                  }
                />
                <Input
                  placeholder="Image URL"
                  value={slideForm.image}
                  onChange={(e) =>
                    setSlideForm({ ...slideForm, image: e.target.value })
                  }
                />
              </CardContent>
            </Card>
            <div className="flex justify-end gap-3">
              {editingSlide && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={resetSlideForm}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {editingSlide ? "Update Slide" : "Add Slide"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="promo">
          <form onSubmit={handlePromoSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Promo Banner</CardTitle>
                <CardDescription>Modify promo section content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Badge"
                  value={promoForm.badge}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, badge: e.target.value })
                  }
                />
                <Input
                  placeholder="Title"
                  value={promoForm.title}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Description"
                  rows={2}
                  value={promoForm.description}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, description: e.target.value })
                  }
                />
                <Input
                  placeholder="Code (used inline)"
                  value={promoForm.code}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, code: e.target.value })
                  }
                />
              </CardContent>
            </Card>
            <div className="flex justify-end gap-3">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" /> Save Promo
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="social">
          <form onSubmit={handleSocialSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>URLs for footer icons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Facebook URL"
                  value={socialForm.facebook}
                  onChange={(e) =>
                    setSocialForm({ ...socialForm, facebook: e.target.value })
                  }
                />
                <Input
                  placeholder="Instagram URL"
                  value={socialForm.instagram}
                  onChange={(e) =>
                    setSocialForm({ ...socialForm, instagram: e.target.value })
                  }
                />
                <Input
                  placeholder="WhatsApp URL or wa.me link"
                  value={socialForm.whatsapp}
                  onChange={(e) =>
                    setSocialForm({ ...socialForm, whatsapp: e.target.value })
                  }
                />
              </CardContent>
            </Card>
            <div className="flex justify-end gap-3">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" /> Save Links
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
