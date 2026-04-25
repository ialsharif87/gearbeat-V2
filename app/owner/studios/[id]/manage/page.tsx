import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../../../lib/supabase/server";
import { requireRole } from "../../../../../lib/auth";
import T from "../../../../../components/t";

export default async function ManageStudioPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireRole("owner");
  const supabase = await createClient();

  const { data: studio, error: studioError } = await supabase
    .from("studios")
    .select("id,name,slug,city,district,price_from,status,cover_image_url")
    .eq("id", id)
    .eq("owner_auth_user_id", user.id)
    .single();

  if (studioError || !studio) {
    notFound();
  }

  const { data: features } = await supabase
    .from("studio_features")
    .select("id,name_en,name_ar,slug,category,sort_order")
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  const { data: selectedFeatures } = await supabase
    .from("studio_feature_links")
    .select("id,feature_id,custom_name,studio_features(name_en,name_ar,category)")
    .eq("studio_id", studio.id);

  const { data: equipment } = await supabase
    .from("studio_equipment")
    .select("id,name,brand,model,category,quantity,notes,created_at")
    .eq("studio_id", studio.id)
    .order("created_at", { ascending: false });

  const selectedFeatureIds = new Set(
    selectedFeatures?.map((item) => item.feature_id) || []
  );

  async function addFeature(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const featureId = String(formData.get("feature_id") || "");
    const studioId = String(formData.get("studio_id") || "");

    if (!featureId || !studioId) {
      throw new Error("Missing feature or studio.");
    }

    const { error } = await supabase.from("studio_feature_links").insert({
      studio_id: studioId,
      feature_id: featureId
    });

    if (error && !error.message.includes("duplicate key")) {
      throw new Error(error.message);
    }

    revalidatePath(`/owner/studios/${studioId}/manage`);
  }

  async function removeFeature(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const linkId = String(formData.get("link_id") || "");
    const studioId = String(formData.get("studio_id") || "");

    if (!linkId || !studioId) {
      throw new Error("Missing feature link.");
    }

    const { error } = await supabase
      .from("studio_feature_links")
      .delete()
      .eq("id", linkId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/owner/studios/${studioId}/manage`);
  }

  async function addEquipment(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const studioId = String(formData.get("studio_id") || "");
    const name = String(formData.get("name") || "").trim();
    const brand = String(formData.get("brand") || "").trim();
    const model = String(formData.get("model") || "").trim();
    const category = String(formData.get("category") || "general").trim();
    const quantity = Number(formData.get("quantity") || 1);
    const notes = String(formData.get("notes") || "").trim();

    if (!studioId || !name) {
      throw new Error("Equipment name is required.");
    }

    const { error } = await supabase.from("studio_equipment").insert({
      studio_id: studioId,
      name,
      brand,
      model,
      category,
      quantity,
      notes
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/owner/studios/${studioId}/manage`);
  }

  async function deleteEquipment(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const equipmentId = String(formData.get("equipment_id") || "");
    const studioId = String(formData.get("studio_id") || "");

    if (!equipmentId || !studioId) {
      throw new Error("Missing equipment.");
    }

    const { error } = await supabase
      .from("studio_equipment")
      .delete()
      .eq("id", equipmentId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/owner/studios/${studioId}/manage`);
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Studio Management" ar="إدارة الاستوديو" />
        </span>

        <h1>{studio.name}</h1>

        <p>
          {studio.city}
          {studio.district ? ` · ${studio.district}` : ""}
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/owner/studios" className="btn btn-secondary">
          <T en="Back to My Studios" ar="العودة إلى استوديوهاتي" />
        </Link>

        <Link href={`/studios/${studio.slug}`} className="btn">
          <T en="View Public Page" ar="عرض الصفحة العامة" />
        </Link>
      </div>

      <div className="manage-studio-layout">
        <div className="card">
          <span className="badge">
            <T en="Selected Features" ar="المميزات المختارة" />
          </span>

          <h2>
            <T en="Studio features" ar="مميزات الاستوديو" />
          </h2>

          <p>
            <T
              en="Choose the features and amenities available in this studio."
              ar="اختر المميزات والخدمات المتوفرة في هذا الاستوديو."
            />
          </p>

          <div className="feature-list">
            {selectedFeatures?.length ? (
              selectedFeatures.map((item) => {
                const feature = Array.isArray(item.studio_features)
                  ? item.studio_features[0]
                  : item.studio_features;

                return (
                  <div className="feature-pill" key={item.id}>
                    <span>
                      <T
                        en={feature?.name_en || item.custom_name || "Feature"}
                        ar={feature?.name_ar || item.custom_name || "ميزة"}
                      />
                    </span>

                    <form action={removeFeature}>
                      <input type="hidden" name="link_id" value={item.id} />
                      <input type="hidden" name="studio_id" value={studio.id} />
                      <button className="mini-danger" type="submit">
                        ×
                      </button>
                    </form>
                  </div>
                );
              })
            ) : (
              <p>
                <T
                  en="No features selected yet."
                  ar="لم يتم اختيار أي مميزات بعد."
                />
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Add Features" ar="إضافة مميزات" />
          </span>

          <h2>
            <T en="Available features" ar="المميزات المتاحة" />
          </h2>

          <div className="feature-list">
            {features?.map((feature) => {
              const isSelected = selectedFeatureIds.has(feature.id);

              return (
                <div className="feature-row" key={feature.id}>
                  <div>
                    <strong>
                      <T en={feature.name_en} ar={feature.name_ar} />
                    </strong>
                    <p>{feature.category}</p>
                  </div>

                  {isSelected ? (
                    <span className="badge">
                      <T en="Added" ar="مضاف" />
                    </span>
                  ) : (
                    <form action={addFeature}>
                      <input type="hidden" name="studio_id" value={studio.id} />
                      <input
                        type="hidden"
                        name="feature_id"
                        value={feature.id}
                      />
                      <button className="btn btn-small" type="submit">
                        <T en="Add" ar="إضافة" />
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ height: 28 }} />

      <div className="manage-studio-layout">
        <form className="card form" action={addEquipment}>
          <span className="badge">
            <T en="Equipment" ar="المعدات" />
          </span>

          <h2>
            <T en="Add equipment" ar="إضافة معدة" />
          </h2>

          <input type="hidden" name="studio_id" value={studio.id} />

          <label>
            <T en="Equipment name" ar="اسم المعدة" /> *
          </label>
          <input
            className="input"
            name="name"
            placeholder="Microphone"
            required
          />

          <label>
            <T en="Brand" ar="العلامة التجارية" />
          </label>
          <input className="input" name="brand" placeholder="Neumann" />

          <label>
            <T en="Model" ar="الموديل" />
          </label>
          <input className="input" name="model" placeholder="U87" />

          <label>
            <T en="Category" ar="التصنيف" />
          </label>
          <input className="input" name="category" placeholder="microphone" />

          <label>
            <T en="Quantity" ar="الكمية" />
          </label>
          <input
            className="input"
            name="quantity"
            type="number"
            min="1"
            defaultValue="1"
          />

          <label>
            <T en="Notes" ar="ملاحظات" />
          </label>
          <textarea className="input" name="notes" rows={3} />

          <button className="btn" type="submit">
            <T en="Add Equipment" ar="إضافة المعدة" />
          </button>
        </form>

        <div className="card">
          <span className="badge">
            <T en="Equipment List" ar="قائمة المعدات" />
          </span>

          <h2>
            <T en="Current equipment" ar="المعدات الحالية" />
          </h2>

          <div className="feature-list">
            {equipment?.length ? (
              equipment.map((item) => (
                <div className="feature-row" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>
                      {[item.brand, item.model, item.category]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p>
                      <T en="Quantity:" ar="الكمية:" /> {item.quantity}
                    </p>
                    {item.notes ? <p>{item.notes}</p> : null}
                  </div>

                  <form action={deleteEquipment}>
                    <input
                      type="hidden"
                      name="equipment_id"
                      value={item.id}
                    />
                    <input type="hidden" name="studio_id" value={studio.id} />
                    <button className="btn btn-secondary btn-small" type="submit">
                      <T en="Delete" ar="حذف" />
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <p>
                <T
                  en="No equipment added yet."
                  ar="لم تتم إضافة أي معدات بعد."
                />
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
