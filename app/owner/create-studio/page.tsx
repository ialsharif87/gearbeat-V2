import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { requireRole } from "../../../lib/auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function CreateStudioPage() {
  const { user } = await requireRole("owner");

  async function createStudio(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const name = String(formData.get("name") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const district = String(formData.get("district") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const priceFrom = Number(formData.get("price_from") || 0);
    const coverImageUrl = String(formData.get("cover_image_url") || "").trim();

    if (!name || !city || !description || !priceFrom) {
      throw new Error("Please fill all required fields.");
    }

    const baseSlug = slugify(name);
    const slug = `${baseSlug}-${Date.now()}`;

    const { error } = await supabase.from("studios").insert({
      owner_auth_user_id: user.id,
      name,
      slug,
      city,
      district,
      address,
      description,
      price_from: priceFrom,
      cover_image_url: coverImageUrl,
      status: "approved",
      verified: false
    });

    if (error) {
      throw new Error(error.message);
    }

    redirect("/owner");
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">Studio Owner</span>
        <h1>Create Studio</h1>
        <p>Add your studio details and publish it to the marketplace.</p>
      </div>

      <form className="card form" action={createStudio}>
        <label>Studio name *</label>
        <input
          className="input"
          name="name"
          placeholder="Example: Riyadh Sound Lab"
          required
        />

        <label>City *</label>
        <input className="input" name="city" placeholder="Riyadh" required />

        <label>District</label>
        <input className="input" name="district" placeholder="Al Olaya" />

        <label>Address</label>
        <input
          className="input"
          name="address"
          placeholder="Full address or location description"
        />

        <label>Description *</label>
        <textarea
          className="input"
          name="description"
          rows={5}
          placeholder="Describe the studio, equipment, vibe, and services."
          required
        />

        <label>Starting price / hour *</label>
        <input
          className="input"
          name="price_from"
          type="number"
          min="1"
          placeholder="250"
          required
        />

        <label>Cover image URL</label>
        <input
          className="input"
          name="cover_image_url"
          placeholder="https://images.unsplash.com/..."
        />

        <button className="btn" type="submit">
          Create Studio
        </button>
      </form>
    </section>
  );
}
