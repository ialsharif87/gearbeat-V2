import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "../../../../lib/admin";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { createAuditLog } from "../../../../lib/audit";
import T from "../../../../components/t";

type AdminRole = "super_admin" | "operations" | "support" | "finance";

type StudioRow = {
  id: string;
  name: string | null;
  slug: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  owner_auth_user_id: string | null;
};

type ReviewRow = {
  id: string;
  rating: number | null;
  cleanliness_rating: number | null;
  equipment_rating: number | null;
  sound_quality_rating: number | null;
  communication_rating: number | null;
  value_rating: number | null;
  comment: string | null;
  status: string | null;
  created_at: string | null;
};

type ReviewRequestRow = {
  id: string;
  status: string | null;
  email_sent_at: string | null;
  expires_at: string | null;
  review_submitted_at: string | null;
  review_token: string | null;
  created_at: string | null;
};

type BookingDetailsRow = {
  id: string;
  customer_auth_user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number | null;
  status: string;
  payment_status: string;
  notes: string | null;
  admin_notes: string | null;
  admin_notes_updated_at: string | null;
  admin_notes_updated_by: string | null;
  created_at: string | null;
  studios: StudioRow | StudioRow[] | null;
  reviews: ReviewRow[] | null;
  review_requests: ReviewRequestRow[] | null;
};

type CustomerProfileRow = {
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  identity_type: string | null;
  identity_number: string | null;
  identity_locked: boolean | null;
  identity_created_at: string | null;
  updated_at: string | null;
};

type AuditLogRow = {
  id: string;
  actor_email: string | null;
  action: string;
  old_values: unknown;
  new_values: unknown;
  metadata: unknown;
  created_at: string | null;
};

function badgeStyle(type: "booking" | "payment", status: string) {
  const green = {
    background: "rgba(30, 215, 96, 0.18)",
    color: "#1ed760",
    border: "1px solid rgba(30, 215, 96, 0.45)"
  };

  const yellow = {
    background: "rgba(255, 193, 7, 0.18)",
    color: "#ffc107",
    border: "1px solid rgba(255, 193, 7, 0.45)"
  };

  const red = {
    background: "rgba(255, 75, 75, 0.18)",
    color: "#ff4b4b",
    border: "1px solid rgba(255, 75, 75, 0.45)"
  };

  if (type === "booking") {
    if (status === "confirmed" || status === "completed") return green;
    if (status === "cancelled") return red;
    return yellow;
  }

  if (status === "paid") return green;
  if (status === "unpaid" || status === "failed") return red;
  if (status === "refunded") return yellow;

  return yellow;
}

function getIdentityLabel(identityType: string | null | undefined) {
  if (identityType === "national_id") return "National ID / هوية وطنية";
  if (identityType === "iqama") return "Iqama / إقامة";
  if (identityType === "passport") return "Passport / جواز سفر";
  if (identityType === "gcc_id") return "GCC ID / هوية خليجية";
  return "—";
}

function getCustomerName(user: any, profile: CustomerProfileRow | null) {
  const metadata = user?.user_metadata || {};

  return (
    profile?.full_name ||
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    metadata.first_name ||
    user?.email ||
    "Customer"
  );
}

function getCustomerPhone(user: any, profile: CustomerProfileRow | null) {
  const metadata = user?.user_metadata || {};

  return (
    profile?.phone ||
    user?.phone ||
    metadata.phone ||
    metadata.phone_number ||
    metadata.mobile ||
    metadata.mobile_number ||
    metadata.whatsapp ||
    "—"
  );
}

function getCustomerIdentityType(user: any, profile: CustomerProfileRow | null) {
  const metadata = user?.user_metadata || {};
  return profile?.identity_type || metadata.identity_type || "";
}

function getCustomerIdentityNumber(user: any, profile: CustomerProfileRow | null) {
  const metadata = user?.user_metadata || {};
  return profile?.identity_number || metadata.identity_number || "—";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

function normalizeStudio(studios: StudioRow | StudioRow[] | null) {
  return Array.isArray(studios) ? studios[0] : studios;
}

function normalizeReviews(reviews: ReviewRow[] | null) {
  return Array.isArray(reviews) ? reviews : [];
}

function normalizeReviewRequests(reviewRequests: ReviewRequestRow[] | null) {
  return Array.isArray(reviewRequests) ? reviewRequests : [];
}

export default async function AdminBookingDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { admin } = await requireAdminRole([
    "super_admin",
    "operations",
    "support",
    "finance"
  ]);

  const supabaseAdmin = createAdminClient();
  const adminRole = admin.admin_role as AdminRole;

  const canManageBookingStatus =
    adminRole === "super_admin" ||
    adminRole === "operations" ||
    adminRole === "support";

  const canManagePaymentStatus =
    adminRole === "super_admin" ||
    adminRole === "operations" ||
    adminRole === "finance";

  const canManageAdminNotes =
    adminRole === "super_admin" ||
    adminRole === "operations" ||
    adminRole === "support" ||
    adminRole === "finance";

  async function updateBookingStatus(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "support"
    ]);

    const supabaseAdmin = createAdminClient();

    const bookingId = String(formData.get("booking_id") || "").trim();
    const status = String(formData.get("status") || "").trim();
    const studioSlug = String(formData.get("studio_slug") || "").trim();

    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!bookingId) {
      throw new Error("Missing booking ID.");
    }

    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid booking status.");
    }

    const { data: oldBooking, error: readError } = await supabaseAdmin
      .from("bookings")
      .select("id,status,payment_status,studio_id,customer_auth_user_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }

    if (!oldBooking) {
      throw new Error("Booking not found.");
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", bookingId);

    if (error) {
      throw new Error(error.message);
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "booking_status_updated",
      entityType: "booking",
      entityId: bookingId,
      oldValues: {
        status: oldBooking.status
      },
      newValues: {
        status
      },
      metadata: {
        admin_role: admin.admin_role,
        studio_slug: studioSlug,
        studio_id: oldBooking.studio_id,
        customer_auth_user_id: oldBooking.customer_auth_user_id
      }
    });

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    revalidatePath("/customer/bookings");
    revalidatePath("/owner/bookings");

    if (studioSlug) {
      revalidatePath(`/studios/${studioSlug}`);
    }
  }

  async function updatePaymentStatus(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "finance"
    ]);

    const supabaseAdmin = createAdminClient();

    const bookingId = String(formData.get("booking_id") || "").trim();
    const paymentStatus = String(formData.get("payment_status") || "").trim();
    const studioSlug = String(formData.get("studio_slug") || "").trim();

    const allowedPaymentStatuses = ["unpaid", "paid", "failed", "refunded"];

    if (!bookingId) {
      throw new Error("Missing booking ID.");
    }

    if (!allowedPaymentStatuses.includes(paymentStatus)) {
      throw new Error("Invalid payment status.");
    }

    const { data: oldBooking, error: readError } = await supabaseAdmin
      .from("bookings")
      .select("id,status,payment_status,studio_id,customer_auth_user_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }

    if (!oldBooking) {
      throw new Error("Booking not found.");
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", bookingId);

    if (error) {
      throw new Error(error.message);
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "booking_payment_status_updated",
      entityType: "booking",
      entityId: bookingId,
      oldValues: {
        payment_status: oldBooking.payment_status
      },
      newValues: {
        payment_status: paymentStatus
      },
      metadata: {
        admin_role: admin.admin_role,
        studio_slug: studioSlug,
        studio_id: oldBooking.studio_id,
        customer_auth_user_id: oldBooking.customer_auth_user_id
      }
    });

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    revalidatePath("/customer/bookings");
    revalidatePath("/owner/bookings");

    if (studioSlug) {
      revalidatePath(`/studios/${studioSlug}`);
    }
  }

  async function updateAdminNotes(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "support",
      "finance"
    ]);

    const supabaseAdmin = createAdminClient();

    const bookingId = String(formData.get("booking_id") || "").trim();
    const adminNotes = String(formData.get("admin_notes") || "").trim();

    if (!bookingId) {
      throw new Error("Missing booking ID.");
    }

    const { data: oldBooking, error: readError } = await supabaseAdmin
      .from("bookings")
      .select("id,admin_notes,studio_id,customer_auth_user_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }

    if (!oldBooking) {
      throw new Error("Booking not found.");
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        admin_notes: adminNotes || null,
        admin_notes_updated_at: new Date().toISOString(),
        admin_notes_updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", bookingId);

    if (error) {
      throw new Error(error.message);
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "booking_admin_notes_updated",
      entityType: "booking",
      entityId: bookingId,
      oldValues: {
        admin_notes: oldBooking.admin_notes
      },
      newValues: {
        admin_notes: adminNotes || null
      },
      metadata: {
        admin_role: admin.admin_role,
        studio_id: oldBooking.studio_id,
        customer_auth_user_id: oldBooking.customer_auth_user_id
      }
    });

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
  }

  const { data: bookingData, error } = await supabaseAdmin
    .from("bookings")
    .select(`
      id,
      customer_auth_user_id,
      booking_date,
      start_time,
      end_time,
      total_amount,
      status,
      payment_status,
      notes,
      admin_notes,
      admin_notes_updated_at,
      admin_notes_updated_by,
      created_at,
      studios (
        id,
        name,
        slug,
        city,
        district,
        address,
        owner_auth_user_id
      ),
      reviews (
        id,
        rating,
        cleanliness_rating,
        equipment_rating,
        sound_quality_rating,
        communication_rating,
        value_rating,
        comment,
        status,
        created_at
      ),
      review_requests (
        id,
        status,
        email_sent_at,
        expires_at,
        review_submitted_at,
        review_token,
        created_at
      )
    `)
    .eq("id", id)
    .single();

  if (error || !bookingData) {
    notFound();
  }

  const booking = bookingData as BookingDetailsRow;

  const studio = normalizeStudio(booking.studios);
  const reviews = normalizeReviews(booking.reviews);
  const reviewRequests = normalizeReviewRequests(booking.review_requests);

  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
    booking.customer_auth_user_id
  );

  const { data: profileData } = await supabaseAdmin
    .from("profiles")
    .select(
      "auth_user_id,email,full_name,phone,role,identity_type,identity_number,identity_locked,identity_created_at,updated_at"
    )
    .eq("auth_user_id", booking.customer_auth_user_id)
    .maybeSingle();

  const profile = (profileData || null) as CustomerProfileRow | null;
  const customer = userData?.user || null;

  const customerName = getCustomerName(customer, profile);
  const customerEmail = profile?.email || customer?.email || "—";
  const customerPhone = getCustomerPhone(customer, profile);
  const identityType = getCustomerIdentityType(customer, profile);
  const identityNumber = getCustomerIdentityNumber(customer, profile);
  const studioSlug = studio?.slug || "";

  let adminNotesUpdatedByEmail = "—";

  if (booking.admin_notes_updated_by) {
    const { data: adminNoteUser } = await supabaseAdmin.auth.admin.getUserById(
      booking.admin_notes_updated_by
    );

    adminNotesUpdatedByEmail = adminNoteUser?.user?.email || "—";
  }

  const { data: auditLogsData } = await supabaseAdmin
    .from("audit_logs")
    .select(
      "id,actor_email,action,old_values,new_values,metadata,created_at"
    )
    .eq("entity_type", "booking")
    .eq("entity_id", booking.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const auditLogs = (auditLogsData || []) as AuditLogRow[];
  const latestReviewRequest = reviewRequests[0];

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin Booking Details" ar="تفاصيل الحجز للإدارة" />
        </span>

        <h1>
          <T en="Booking Details" ar="تفاصيل الحجز" />
        </h1>

        <p>
          <T
            en="Full booking view with customer, identity, studio, payment, review, internal notes, and audit history."
            ar="عرض كامل للحجز مع بيانات العميل، الهوية، الاستوديو، الدفع، التقييم، الملاحظات الداخلية، وسجل التغييرات."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/admin/bookings" className="btn btn-secondary">
          <T en="Back to Bookings" ar="العودة إلى الحجوزات" />
        </Link>

        {studioSlug ? (
          <Link href={`/studios/${studioSlug}`} className="btn btn-secondary">
            <T en="View Studio" ar="عرض الاستوديو" />
          </Link>
        ) : null}
      </div>

      <div className="admin-detail-grid">
        <div className="card">
          <span className="badge">
            <T en="Booking" ar="الحجز" />
          </span>

          <h2>{booking.booking_date}</h2>

          <p>
            <T en="Time:" ar="الوقت:" />{" "}
            <strong>
              {booking.start_time} - {booking.end_time}
            </strong>
          </p>

          <p>
            <T en="Amount:" ar="المبلغ:" />{" "}
            <strong>{booking.total_amount} SAR</strong>
          </p>

          <div className="admin-badge-stack">
            <span className="badge" style={badgeStyle("booking", booking.status)}>
              {booking.status}
            </span>

            <span
              className="badge"
              style={badgeStyle("payment", booking.payment_status)}
            >
              {booking.payment_status}
            </span>
          </div>

          <p>
            <T en="Created:" ar="تم الإنشاء:" /> {formatDate(booking.created_at)}
          </p>

          <p>
            <T en="Customer notes:" ar="ملاحظات العميل:" />{" "}
            {booking.notes || "—"}
          </p>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Customer" ar="العميل" />
          </span>

          <h2>{customerName}</h2>

          <p>
            <T en="Email:" ar="الإيميل:" /> <strong>{customerEmail}</strong>
          </p>

          <p>
            <T en="Phone:" ar="الجوال:" /> <strong>{customerPhone}</strong>
          </p>

          <p>
            <T en="User ID:" ar="رقم المستخدم:" />{" "}
            <small>{booking.customer_auth_user_id}</small>
          </p>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Identity" ar="الهوية" />
          </span>

          <h2>{getIdentityLabel(identityType)}</h2>

          <p>
            <T en="Identity number:" ar="رقم الهوية:" />{" "}
            <strong>{identityNumber}</strong>
          </p>

          <p>
            <T en="Status:" ar="الحالة:" />{" "}
            {profile?.identity_locked ? (
              <span className="badge">
                <T en="Locked" ar="مقفلة" />
              </span>
            ) : (
              <span className="badge">
                <T en="Not locked" ar="غير مقفلة" />
              </span>
            )}
          </p>

          <p>
            <T en="Created:" ar="تم الإنشاء:" />{" "}
            {formatDate(profile?.identity_created_at)}
          </p>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Studio" ar="الاستوديو" />
          </span>

          <h2>{studio?.name || "Studio"}</h2>

          <p>
            {studio?.city || ""}
            {studio?.district ? ` · ${studio.district}` : ""}
          </p>

          <p>{studio?.address || "—"}</p>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card admin-notes-card">
        <span className="badge">
          <T en="Internal Admin Notes" ar="ملاحظات الإدارة الداخلية" />
        </span>

        <h2>
          <T en="Private notes" ar="ملاحظات خاصة" />
        </h2>

        <p>
          <T
            en="These notes are visible only to admin users. Customers and studio owners cannot see them."
            ar="هذه الملاحظات تظهر فقط لمستخدمي الإدارة. العميل وصاحب الاستوديو لا يستطيعان رؤيتها."
          />
        </p>

        {canManageAdminNotes ? (
          <form className="form" action={updateAdminNotes}>
            <input type="hidden" name="booking_id" value={booking.id} />

            <label>
              <T en="Admin notes" ar="ملاحظات الإدارة" />
            </label>

            <textarea
              className="input"
              name="admin_notes"
              rows={6}
              defaultValue={booking.admin_notes || ""}
              placeholder="Write internal notes about this booking..."
            />

            <button className="btn" type="submit">
              <T en="Save Admin Notes" ar="حفظ ملاحظات الإدارة" />
            </button>
          </form>
        ) : null}

        <div className="admin-notes-meta">
          <p>
            <T en="Last updated:" ar="آخر تحديث:" />{" "}
            {formatDate(booking.admin_notes_updated_at)}
          </p>

          <p>
            <T en="Updated by:" ar="تم التحديث بواسطة:" />{" "}
            {adminNotesUpdatedByEmail}
          </p>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Actions" ar="الإجراءات" />
        </span>

        <h2>
          <T en="Manage booking" ar="إدارة الحجز" />
        </h2>

        <div className="admin-action-section">
          {canManageBookingStatus ? (
            <div>
              <h3>
                <T en="Booking status" ar="حالة الحجز" />
              </h3>

              <div className="admin-inline-action-grid">
                {["pending", "confirmed", "completed", "cancelled"].map(
                  (status: string) =>
                    booking.status !== status ? (
                      <form action={updateBookingStatus} key={status}>
                        <input type="hidden" name="booking_id" value={booking.id} />
                        <input
                          type="hidden"
                          name="studio_slug"
                          value={studioSlug}
                        />
                        <input type="hidden" name="status" value={status} />
                        <button
                          className={
                            status === "confirmed" || status === "completed"
                              ? "btn btn-small"
                              : "btn btn-secondary btn-small"
                          }
                          type="submit"
                        >
                          {status}
                        </button>
                      </form>
                    ) : null
                )}
              </div>
            </div>
          ) : null}

          {canManagePaymentStatus ? (
            <div>
              <h3>
                <T en="Payment status" ar="حالة الدفع" />
              </h3>

              <div className="admin-inline-action-grid">
                {["unpaid", "paid", "failed", "refunded"].map(
                  (paymentStatus: string) =>
                    booking.payment_status !== paymentStatus ? (
                      <form action={updatePaymentStatus} key={paymentStatus}>
                        <input type="hidden" name="booking_id" value={booking.id} />
                        <input
                          type="hidden"
                          name="studio_slug"
                          value={studioSlug}
                        />
                        <input
                          type="hidden"
                          name="payment_status"
                          value={paymentStatus}
                        />
                        <button
                          className={
                            paymentStatus === "paid"
                              ? "btn btn-small"
                              : "btn btn-secondary btn-small"
                          }
                          type="submit"
                        >
                          {paymentStatus}
                        </button>
                      </form>
                    ) : null
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="admin-two-column">
        <div className="card">
          <span className="badge">
            <T en="Review Request" ar="طلب التقييم" />
          </span>

          {latestReviewRequest ? (
            <>
              <h2>{latestReviewRequest.status}</h2>

              <p>
                <T en="Email sent:" ar="تم إرسال الإيميل:" />{" "}
                {formatDate(latestReviewRequest.email_sent_at)}
              </p>

              <p>
                <T en="Expires:" ar="ينتهي:" />{" "}
                {formatDate(latestReviewRequest.expires_at)}
              </p>

              <p>
                <T en="Submitted:" ar="تم الإرسال:" />{" "}
                {formatDate(latestReviewRequest.review_submitted_at)}
              </p>
            </>
          ) : (
            <p>
              <T
                en="No review request has been created for this booking yet."
                ar="لم يتم إنشاء طلب تقييم لهذا الحجز حتى الآن."
              />
            </p>
          )}
        </div>

        <div className="card">
          <span className="badge">
            <T en="Review" ar="التقييم" />
          </span>

          {reviews.length ? (
            reviews.map((review: ReviewRow) => (
              <div key={review.id} className="admin-list-row">
                <div>
                  <strong>{review.rating} ★</strong>
                  <p>{review.comment || "No written comment"}</p>
                  <p className="admin-muted-line">{review.status}</p>
                </div>
              </div>
            ))
          ) : (
            <p>
              <T en="No review submitted yet." ar="لم يتم إرسال تقييم بعد." />
            </p>
          )}
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Audit Log" ar="سجل التغييرات" />
        </span>

        <h2>
          <T en="Recent changes" ar="آخر التغييرات" />
        </h2>

        <div className="admin-list">
          {auditLogs.length ? (
            auditLogs.map((log: AuditLogRow) => (
              <div className="admin-list-row" key={log.id}>
                <div>
                  <strong>{log.action}</strong>
                  <p>{log.actor_email || "Unknown user"}</p>
                  <p className="admin-muted-line">{formatDate(log.created_at)}</p>
                </div>

                <div>
                  <pre className="audit-json">
                    {JSON.stringify(
                      {
                        old: log.old_values,
                        new: log.new_values
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            ))
          ) : (
            <p>
              <T en="No audit activity yet." ar="لا يوجد سجل تغييرات حتى الآن." />
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
