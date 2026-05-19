import { useState } from "react";
import type { Announcement, AnnouncementAuthorType, AnnouncementTag } from "../model/types";
import { BsPin } from "react-icons/bs";
import { LuBuilding2, LuCalendar } from "react-icons/lu";
import { MdOutlineSchool } from "react-icons/md";
import {
  HiOutlineChevronRight,
  HiOutlineShare,
  HiOutlineTrash,
  HiOutlinePencil,
} from "react-icons/hi";

const TAGS: { key: AnnouncementTag; label: string; color: string; bg: string }[] = [
  { key: "event",       label: "Event",       color: "#3356AA", bg: "#EEF2FF" },
  { key: "scholarship", label: "Scholarship", color: "#10B981", bg: "#E6F7EF" },
  { key: "programme",   label: "Programme",   color: "#7C5CFF", bg: "#F1ECFE" },
  { key: "update",      label: "Update",      color: "#3D5AFE", bg: "#EBF2FE" },
];

export function tagMeta(tag: AnnouncementTag) {
  return TAGS.find((t) => t.key === tag) ?? null;
}

export const TAG_OPTIONS = TAGS;

function formatFeedDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatManageDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function authorLabel(a: Announcement) {
  return a.author_type === "university" && a.university_name ? a.university_name : "NTC";
}

function authorRole(a: Announcement) {
  return a.author_type === "university" ? "University" : "NTC Admin";
}

export function AuthorAvatar({
  name,
  type,
  avatarUrl,
}: {
  name: string;
  type: AnnouncementAuthorType;
  avatarUrl?: string;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
    );
  }
  const bg = type === "university" ? "bg-purple-600" : "bg-[#3356AA]";
  return (
    <div
      className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
    >
      {initials(name)}
    </div>
  );
}

export function TypeBadge({ type }: { type: AnnouncementAuthorType }) {
  if (type === "university") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
        <MdOutlineSchool size={12} /> University
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
      <LuBuilding2 size={12} /> NTC
    </span>
  );
}

export function TagBadge({ tag }: { tag: AnnouncementTag }) {
  const meta = tagMeta(tag);
  if (!meta) return null;
  return (
    <span
      className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
      style={{ color: meta.color, backgroundColor: meta.bg }}
    >
      {meta.label}
    </span>
  );
}

export type AnnouncementCardVariant = "feed" | "manage";

export type AnnouncementCardProps = {
  item: Announcement;
  variant: AnnouncementCardVariant;
  onView: (a: Announcement) => void;
  onEdit?: (a: Announcement) => void;
  onDelete?: (id: number) => void;
  onShare?: (a: Announcement) => void;
  confirmDelete?: boolean;
  previewLength?: number;
};

export function AnnouncementCard({
  item,
  variant,
  onView,
  onEdit,
  onDelete,
  onShare,
  confirmDelete = false,
  previewLength,
}: AnnouncementCardProps) {
  const [confirming, setConfirming] = useState(false);
  const maxLen = previewLength ?? (variant === "feed" ? 200 : 180);
  const preview = item.body.length > maxLen ? item.body.slice(0, maxLen) + "…" : item.body;

  const hasActions = Boolean(onShare || onEdit || onDelete);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        {variant === "feed" ? (
          <>
            <div className="flex items-center gap-3">
              <AuthorAvatar
                name={authorLabel(item)}
                type={item.author_type}
                avatarUrl={item.author_avatar_url}
              />
              <div>
                <p className="text-sm font-semibold text-[#111928]">{authorLabel(item)}</p>
                <p className="text-xs text-gray-400">
                  {authorRole(item)} · {formatFeedDate(item.created_at)}
                </p>
              </div>
            </div>
            <TypeBadge type={item.author_type} />
          </>
        ) : (
          <>
            <TagBadge tag={item.tag} />
            {hasActions && (
              <div className="flex items-center gap-2">
                {onShare && (
                  <button
                    onClick={() => onShare(item)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Share"
                  >
                    <HiOutlineShare size={16} />
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit"
                  >
                    <HiOutlinePencil size={16} />
                  </button>
                )}
                {onDelete && (
                  confirmDelete && confirming ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onDelete(item.id);
                          setConfirming(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirming(false)}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        confirmDelete ? setConfirming(true) : onDelete(item.id)
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <HiOutlineTrash size={16} />
                    </button>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* body */}
      <div>
        <h3 className="text-[15px] font-bold text-[#111928] mb-1">{item.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{preview}</p>
      </div>

      {/* footer */}
      {variant === "feed" ? (
        <div className="flex items-center justify-end pt-1 border-t border-gray-50">
          <button
            onClick={() => onView(item)}
            className="flex items-center gap-1 text-sm text-[#3356AA] font-medium hover:underline"
          >
            View Full Post <HiOutlineChevronRight size={15} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <LuCalendar size={13} />
            {formatManageDate(item.created_at)}
          </span>
          <button
            onClick={() => onView(item)}
            className="flex items-center gap-1 text-sm text-[#3356AA] font-medium hover:underline"
          >
            View post <HiOutlineChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Pinned (applicant sidebar) ──────────────────────────────────────────────

export function PinnedCard({
  item,
  onView,
}: {
  item: Announcement;
  onView: (a: Announcement) => void;
}) {
  const name = authorLabel(item);
  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 mb-2">
        <AuthorAvatar name={name} type={item.author_type} avatarUrl={item.author_avatar_url} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111928] truncate">{name}</p>
        </div>
        <span className="flex items-center gap-1 text-xs text-gray-400 font-medium flex-shrink-0">
          <BsPin size={11} /> Pinned
        </span>
      </div>
      <TypeBadge type={item.author_type} />
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.body}</p>
      <button
        onClick={() => onView(item)}
        className="flex items-center gap-1 mt-2 text-xs text-[#3356AA] font-medium hover:underline"
      >
        View post <HiOutlineChevronRight size={13} />
      </button>
    </div>
  );
}

// ─── exported helpers ────────────────────────────────────────────────────────

export { authorLabel, authorRole, formatFeedDate, formatManageDate };
