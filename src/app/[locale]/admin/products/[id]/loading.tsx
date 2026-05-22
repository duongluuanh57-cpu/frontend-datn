export default function EditProductLoading() {
  const shimmer = 'bg-gradient-to-r from-[var(--admin-surface-muted)] via-[var(--admin-border-subtle)] to-[var(--admin-surface-muted)] bg-[length:200%_100%] animate-shimmer rounded-[var(--admin-radius)]';

  return (
    <div className="admin-form-page animate-pulse">
      {/* Toolbar skeleton */}
      <div className="admin-form-toolbar">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${shimmer}`} />
          <div className="flex flex-col gap-2">
            <div className={`w-40 h-4 ${shimmer}`} />
            <div className={`w-24 h-3 ${shimmer}`} />
          </div>
        </div>
        <div className={`w-32 h-9 ${shimmer}`} />
      </div>

      <div className="admin-form-grid">
        {/* Left column skeleton - ProductDetailsSection */}
        <div className="admin-form-column-left">
          <div className="admin-form-card">
            <div className="admin-form-card__head">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${shimmer}`} />
                <div className="flex flex-col gap-2">
                  <div className={`w-36 h-4 ${shimmer}`} />
                  <div className={`w-52 h-3 ${shimmer}`} />
                </div>
              </div>
            </div>
            <div className="admin-form-fields space-y-4">
              <div className="admin-field">
                <div className={`w-20 h-3 mb-1 ${shimmer}`} />
                <div className={`w-full h-10 ${shimmer}`} />
              </div>
              <div className="admin-field">
                <div className={`w-24 h-3 mb-1 ${shimmer}`} />
                <div className={`w-full h-24 ${shimmer}`} />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="admin-field">
                    <div className={`w-16 h-3 mb-1 ${shimmer}`} />
                    <div className={`w-full h-11 ${shimmer}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column skeleton - Media + SEO */}
        <div className="admin-form-column-right space-y-5">
          <div className="admin-form-card">
            <div className="admin-form-card__head">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${shimmer}`} />
                <div className="flex flex-col gap-2">
                  <div className={`w-28 h-4 ${shimmer}`} />
                  <div className={`w-40 h-3 ${shimmer}`} />
                </div>
              </div>
            </div>
            <div className="admin-form-fields space-y-4">
              <div className={`w-full h-32 rounded-[var(--admin-radius)] ${shimmer}`} />
              <div className="admin-field">
                <div className={`w-16 h-3 mb-1 ${shimmer}`} />
                <div className={`w-full h-10 ${shimmer}`} />
              </div>
              <div className="admin-field">
                <div className={`w-12 h-3 mb-1 ${shimmer}`} />
                <div className={`w-full h-11 ${shimmer}`} />
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-card__head">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${shimmer}`} />
                <div className="flex flex-col gap-2">
                  <div className={`w-24 h-4 ${shimmer}`} />
                  <div className={`w-36 h-3 ${shimmer}`} />
                </div>
              </div>
            </div>
            <div className="admin-form-fields space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="admin-field">
                  <div className={`w-20 h-3 mb-1 ${shimmer}`} />
                  <div className={`w-full h-10 ${shimmer}`} />
                </div>
              ))}
              <div className={`w-full h-12 ${shimmer}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
