import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, MessageSquare, ThumbsUp, Tractor, Send, RefreshCw,
  AlertCircle, CheckCircle2, Search, Filter, ChevronDown,
  MapPin, Image as ImageIcon, X, Flag, Pencil, Trash2,
  ChevronRight, Loader2, Camera
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import PageLoader from '../components/PageLoader';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CROPS = [
  { value: '', labelKey: 'filter_all_crops' },
  { value: 'Paddy / Rice', labelKey: 'crop_select_paddy' },
  { value: 'Tomato', labelKey: 'crop_select_tomato' },
  { value: 'Chilli', labelKey: 'crop_select_chilli' },
  { value: 'Cotton', labelKey: 'crop_select_cotton' },
  { value: 'Maize', labelKey: 'crop_select_maize' },
  { value: 'Groundnut', labelKey: 'crop_select_groundnut' },
  { value: 'Sugarcane', labelKey: 'crop_select_sugarcane' },
  { value: 'Banana', labelKey: 'crop_select_banana' },
  { value: 'Brinjal', labelKey: 'crop_select_brinjal' },
  { value: 'Potato', labelKey: 'crop_select_potato' },
  { value: 'Onion', labelKey: 'crop_select_onion' },
  { value: 'Mango', labelKey: 'crop_select_mango' },
  { value: 'Other', labelKey: 'crop_select_other' },
];

const FORM_CROPS = CROPS.filter((c) => c.value !== '');

const CATEGORIES = [
  { value: '', labelKey: 'filter_all_categories' },
  { value: 'crop_problem', labelKey: 'cat_crop_problem' },
  { value: 'disease', labelKey: 'cat_disease' },
  { value: 'pest', labelKey: 'cat_pest' },
  { value: 'irrigation', labelKey: 'cat_irrigation' },
  { value: 'fertilizer', labelKey: 'cat_fertilizer' },
  { value: 'seeds', labelKey: 'cat_seeds' },
  { value: 'market_price', labelKey: 'cat_market_price' },
  { value: 'weather', labelKey: 'cat_weather' },
  { value: 'govt_scheme', labelKey: 'cat_govt_scheme' },
  { value: 'machinery', labelKey: 'cat_machinery' },
  { value: 'general', labelKey: 'cat_general' },
  { value: 'other', labelKey: 'cat_other' },
];

const FORM_CATEGORIES = CATEGORIES.filter((c) => c.value !== '');

const MACHINE_TYPES = [
  { value: 'tractor', labelKey: 'mach_tractor' },
  { value: 'combine_harvester', labelKey: 'mach_combine' },
  { value: 'rotavator', labelKey: 'mach_rotavator' },
  { value: 'seed_drill', labelKey: 'mach_seed_drill' },
  { value: 'drone_sprayer', labelKey: 'mach_drone' },
  { value: 'power_tiller', labelKey: 'mach_tiller' },
  { value: 'cultivator', labelKey: 'mach_cultivator' },
  { value: 'sprayer', labelKey: 'mach_sprayer' },
  { value: 'thresher', labelKey: 'mach_thresher' },
  { value: 'other', labelKey: 'mach_other' },
];

const PRICE_UNITS = [
  { value: 'per_hour', labelKey: 'per_hour' },
  { value: 'per_day', labelKey: 'per_day' },
  { value: 'per_acre', labelKey: 'per_acre' },
  { value: 'negotiable', labelKey: 'negotiable' },
];

const REPORT_REASONS = [
  { value: 'spam', labelKey: 'report_spam' },
  { value: 'misleading', labelKey: 'report_misleading' },
  { value: 'abusive', labelKey: 'report_abusive' },
  { value: 'inappropriate', labelKey: 'report_inappropriate' },
  { value: 'advertisement', labelKey: 'report_advertisement' },
  { value: 'scam', labelKey: 'report_scam' },
  { value: 'other', labelKey: 'report_other' },
];

const CATEGORY_COLORS = {
  crop_problem: 'bg-yellow-100 text-yellow-800',
  disease: 'bg-red-100 text-red-800',
  pest: 'bg-orange-100 text-orange-800',
  irrigation: 'bg-blue-100 text-blue-800',
  fertilizer: 'bg-lime-100 text-lime-800',
  seeds: 'bg-green-100 text-green-800',
  market_price: 'bg-purple-100 text-purple-800',
  weather: 'bg-sky-100 text-sky-800',
  govt_scheme: 'bg-indigo-100 text-indigo-800',
  machinery: 'bg-amber-100 text-amber-800',
  general: 'bg-gray-100 text-gray-700',
  other: 'bg-gray-100 text-gray-600',
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// ---------------------------------------------------------------------------
// Small reusable components
// ---------------------------------------------------------------------------

function Avatar({ name = '', size = 9 }) {
  const letter = (name || 'F').trim().charAt(0).toUpperCase();
  const colors = [
    'bg-green-600', 'bg-teal-600', 'bg-emerald-600',
    'bg-lime-700', 'bg-cyan-700', 'bg-blue-600',
  ];
  const idx = letter.charCodeAt(0) % colors.length;
  return (
    <div
      className={`w-${size} h-${size} rounded-full ${colors[idx]} text-white flex items-center justify-center font-bold text-sm shrink-0`}
    >
      {letter}
    </div>
  );
}

function CategoryBadge({ category, display }) {
  const cls = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${cls}`}>
      {display || category}
    </span>
  );
}

function Toast({ msg, type = 'success', onClose }) {
  if (!msg) return null;
  const isErr = type === 'error';
  return (
    <div
      className={`p-4 rounded-2xl flex items-center gap-2.5 text-sm ${
        isErr
          ? 'bg-red-50 border border-red-200 text-red-800'
          : 'bg-green-50 border border-green-200 text-green-800'
      }`}
    >
      {isErr
        ? <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        : <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />}
      <span className="flex-1">{msg}</span>
      <button type="button" onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Report Modal
// ---------------------------------------------------------------------------

function ReportModal({ target, targetType, onClose, onSubmit, t }) {
  const [reason, setReason] = useState('spam');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(reason, description);
    setSubmitting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500" />
            {t('report_btn')}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('report_reason_label')}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 outline-none bg-white"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{t(r.labelKey)}</option>
              ))}
            </select>
          </div>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('report_description_placeholder')}
            className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-red-500 outline-none resize-none"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100">
              {t('cancel_btn')}
            </button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('report_submit_btn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Machinery Form Modal
// ---------------------------------------------------------------------------

function MachineryFormModal({ currentUser, onClose, onCreated, t }) {
  const [form, setForm] = useState({
    machine_type: 'tractor',
    machine_name: '',
    description: '',
    locality: currentUser?.village || '',
    district: currentUser?.district || '',
    state: currentUser?.state || '',
    availability: 'Available',
    rental_price: '',
    price_unit: 'per_day',
    contact_method: 'Contact via community reply',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { setError(t('image_invalid_type')); return; }
    if (file.size > MAX_IMAGE_BYTES) { setError(t('image_too_large')); return; }
    setError('');
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.machine_name.trim()) { setError('Machine name is required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (image) fd.append('image', image);
      const result = await api.community.createMachinery(fd);
      onCreated(result);
      onClose();
    } catch (err) {
      setError(err.message || t('failed_create_machinery'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 my-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Tractor className="w-4 h-4 text-green-600" />
            {t('btn_list_equipment')}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-2.5">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('machinery_type_label')}</label>
              <select value={form.machine_type}
                onChange={(e) => setForm((f) => ({ ...f, machine_type: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none bg-white">
                {MACHINE_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>{t(m.labelKey)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('machinery_name_label')} *</label>
              <input type="text" value={form.machine_name}
                onChange={(e) => setForm((f) => ({ ...f, machine_name: e.target.value }))}
                placeholder={t('machinery_name_placeholder')}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('machinery_desc_label')}</label>
            <textarea rows={2} value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none resize-none" />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('locality_placeholder')}</label>
              <input type="text" value={form.locality}
                onChange={(e) => setForm((f) => ({ ...f, locality: e.target.value }))}
                placeholder={t('locality_placeholder')}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('district_placeholder')}</label>
              <input type="text" value={form.district}
                onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                placeholder={t('district_placeholder')}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('state_placeholder')}</label>
              <input type="text" value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                placeholder={t('state_placeholder')}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none" />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('machinery_price_label')}</label>
              <input type="number" min="0" step="0.01" value={form.rental_price}
                onChange={(e) => setForm((f) => ({ ...f, rental_price: e.target.value }))}
                placeholder="₹"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('machinery_price_unit_label')}</label>
              <select value={form.price_unit}
                onChange={(e) => setForm((f) => ({ ...f, price_unit: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none bg-white">
                {PRICE_UNITS.map((p) => (
                  <option key={p.value} value={p.value}>{t(p.labelKey)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('machinery_availability_label')}</label>
              <input type="text" value={form.availability}
                onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))}
                placeholder={t('machinery_availability_placeholder')}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('machinery_contact_label')}</label>
            <input type="text" value={form.contact_method}
              onChange={(e) => setForm((f) => ({ ...f, contact_method: e.target.value }))}
              placeholder={t('machinery_contact_placeholder')}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none" />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t('upload_image')}</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt={t('image_preview')} className="h-24 rounded-xl object-cover" />
                <button type="button" onClick={() => { setImage(null); setImagePreview(null); }}
                  className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 shadow text-gray-600 hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 text-xs text-gray-500 cursor-pointer hover:border-green-500 hover:text-green-700 w-fit">
                <Camera className="w-4 h-4" />
                <span>{t('upload_image')}</span>
                <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100">
              {t('cancel_btn')}
            </button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {submitting ? t('btn_posting') : t('btn_list_equipment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Post Card
// ---------------------------------------------------------------------------

function PostCard({ post, currentUser, isLoggedIn, onHelpful, onReply, onReport, onDelete, onEdit, t }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [allReplies, setAllReplies] = useState(null); // null = not yet loaded
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editSaving, setEditSaving] = useState(false);
  const navigate = useNavigate();

  const authorName = post.author_info?.name || 'Farmer';
  const location = post.location_display || '';
  const isOwner = isLoggedIn && currentUser &&
    post.author_info?.name === (currentUser.name || currentUser.username);

  async function loadReplies() {
    setLoadingReplies(true);
    try {
      const data = await api.community.getReplies(post.id);
      setAllReplies(Array.isArray(data) ? data : []);
    } catch {
      setAllReplies(post.replies_list || []);
    } finally {
      setLoadingReplies(false);
    }
  }

  function toggleReplies() {
    if (!showReplies && allReplies === null) loadReplies();
    setShowReplies((v) => !v);
  }

  async function submitReply() {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      const newReply = await onReply(post.id, replyText.trim());
      setReplyText('');
      setAllReplies((prev) => [...(prev || post.replies_list || []), newReply]);
    } catch {
      // handled by parent
    } finally {
      setReplySubmitting(false);
    }
  }

  async function saveEdit() {
    if (editContent.trim().length < 10) return;
    setEditSaving(true);
    await onEdit(post.id, editContent.trim());
    setEditSaving(false);
    setEditMode(false);
  }

  async function handleDelete() {
    if (!window.confirm(t('confirm_delete_post'))) return;
    await onDelete(post.id);
  }

  const displayReplies = allReplies ?? (post.replies_list || []);
  const replyCount = post.reply_count ?? post.replies ?? 0;

  return (
    <>
      {reportOpen && (
        <ReportModal
          target={post.id}
          targetType="post"
          onClose={() => setReportOpen(false)}
          onSubmit={(reason, desc) => onReport(post.id, 'post', reason, desc)}
          t={t}
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 hover:border-green-200 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={authorName} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="font-bold text-gray-900 text-sm truncate">{authorName}</p>
                {post.is_official && (
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded">{t('badge_official')}</span>
                )}
                {post.is_verified && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">{t('badge_verified')}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1 text-[11px] text-gray-400">
                {location && (
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {location}
                  </span>
                )}
                {location && <span>•</span>}
                <span>{post.time_ago}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {post.is_rental && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg flex items-center gap-1">
                <Tractor className="w-3 h-3" />
                {t('tag_rental')}
              </span>
            )}
            {post.category && (
              <CategoryBadge category={post.category} display={post.category_display} />
            )}
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded-lg">
              {post.crop}
            </span>
          </div>
        </div>

        {/* Content */}
        {editMode ? (
          <div className="space-y-2">
            <textarea
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-green-300 text-sm focus:ring-2 focus:ring-green-600 outline-none resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditMode(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-xl">
                {t('cancel_btn')}
              </button>
              <button type="button" onClick={saveEdit} disabled={editSaving || editContent.trim().length < 10}
                className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-1">
                {editSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                {t('save_btn')}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        )}

        {/* Attached image */}
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post attachment"
            className="rounded-xl max-h-64 object-cover w-full cursor-pointer"
            onClick={() => window.open(post.image_url, '_blank')}
          />
        )}

        {/* Action bar */}
        <div className="pt-2 border-t border-gray-50 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-500">
          {/* Helpful */}
          <button
            type="button"
            onClick={() => {
              if (!isLoggedIn) { navigate('/login'); return; }
              onHelpful(post.id);
            }}
            className={`flex items-center gap-1.5 transition-colors ${
              post.is_helpful_by_me ? 'text-green-600' : 'hover:text-green-600'
            }`}
            aria-label={t('helpful_btn')}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${post.is_helpful_by_me ? 'fill-green-600' : ''}`} />
            {post.helpful_count ?? post.likes ?? 0} {t('helpful_btn')}
          </button>

          {/* Replies */}
          <button
            type="button"
            onClick={toggleReplies}
            className="flex items-center gap-1.5 hover:text-green-600 transition-colors"
            aria-label={t('replies_btn')}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {replyCount} {t('replies_btn')}
          </button>

          {/* Report */}
          {isLoggedIn && !isOwner && (
            <button type="button" onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 hover:text-red-500 transition-colors ml-auto"
              aria-label={t('report_btn')}>
              <Flag className="w-3.5 h-3.5" />
              {t('report_btn')}
            </button>
          )}

          {/* Edit / Delete (own posts only) */}
          {isOwner && (
            <div className="flex items-center gap-2 ml-auto">
              <button type="button" onClick={() => setEditMode(true)}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                aria-label={t('edit_btn')}>
                <Pencil className="w-3.5 h-3.5" />
                {t('edit_btn')}
              </button>
              <button type="button" onClick={handleDelete}
                className="flex items-center gap-1 hover:text-red-600 transition-colors"
                aria-label={t('delete_btn')}>
                <Trash2 className="w-3.5 h-3.5" />
                {t('delete_btn')}
              </button>
            </div>
          )}
        </div>

        {/* Replies section */}
        {showReplies && (
          <div className="space-y-2 pt-1">
            {loadingReplies ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t('loading_more')}
              </div>
            ) : displayReplies.length === 0 ? (
              <p className="text-xs text-gray-400 py-1">{t('no_replies_yet')}</p>
            ) : (
              displayReplies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  currentUser={currentUser}
                  isLoggedIn={isLoggedIn}
                  onReport={(rid, reason, desc) => onReport(rid, 'reply', reason, desc)}
                  t={t}
                />
              ))
            )}

            {/* Reply input */}
            {isLoggedIn ? (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitReply(); } }}
                  placeholder={t('write_reply_placeholder')}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <button
                  type="button"
                  onClick={submitReply}
                  disabled={replySubmitting || !replyText.trim()}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {replySubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  {t('reply_btn')}
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-xs text-green-700 font-semibold hover:underline">
                {t('login_required_title')} →
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Reply Item
// ---------------------------------------------------------------------------

function ReplyItem({ reply, currentUser, isLoggedIn, onReport, t }) {
  const [reportOpen, setReportOpen] = useState(false);
  const authorName = reply.author_info?.name || reply.author || 'Farmer';
  const isOwner = isLoggedIn && currentUser &&
    authorName === (currentUser.name || currentUser.username);

  return (
    <>
      {reportOpen && (
        <ReportModal
          target={reply.id}
          targetType="reply"
          onClose={() => setReportOpen(false)}
          onSubmit={(reason, desc) => onReport(reply.id, reason, desc)}
          t={t}
        />
      )}
      <div className="p-2.5 bg-gray-50 rounded-xl text-xs space-y-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Avatar name={authorName} size={6} />
            <span className="font-bold text-gray-800">{authorName}</span>
            {reply.is_scientist && (
              <span className="text-[9px] bg-green-100 text-green-700 px-1 py-0.5 rounded font-semibold">{t('badge_scientist')}</span>
            )}
            {reply.locality_display && (
              <span className="text-gray-400 text-[10px] flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5" />{reply.locality_display}
              </span>
            )}
            <span className="text-gray-400">• {reply.time_ago}</span>
          </div>
          {isLoggedIn && !isOwner && (
            <button type="button" onClick={() => setReportOpen(true)}
              className="text-gray-300 hover:text-red-400 transition-colors"
              aria-label={t('report_btn')}>
              <Flag className="w-3 h-3" />
            </button>
          )}
        </div>
        <p className="text-gray-700 pl-7.5">{reply.content}</p>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Machinery Card
// ---------------------------------------------------------------------------

function MachineryCard({ listing, t }) {
  const ownerName = listing.owner_info?.name || 'Farmer';
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2.5 hover:border-green-200 transition-colors">
      {listing.image_url && (
        <img src={listing.image_url} alt={listing.machine_name}
          className="w-full h-32 object-cover rounded-xl" />
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-gray-900 text-sm leading-snug">{listing.machine_name}</p>
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800 inline-block mt-0.5">
            {listing.machine_type_display}
          </span>
        </div>
        {listing.rental_price && (
          <div className="text-right shrink-0">
            <p className="font-bold text-green-700 text-sm">₹{listing.rental_price}</p>
            <p className="text-[10px] text-gray-400">{listing.price_unit_display}</p>
          </div>
        )}
      </div>

      {listing.description && (
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{listing.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
        <span className="flex items-center gap-0.5">
          <Tractor className="w-3 h-3 text-green-600" />
          {ownerName}
        </span>
        {listing.location_display && (
          <span className="flex items-center gap-0.5">
            <MapPin className="w-3 h-3 text-green-600" />
            {listing.location_display}
          </span>
        )}
        <span className="flex items-center gap-0.5">
          <CheckCircle2 className="w-3 h-3 text-green-500" />
          {listing.availability}
        </span>
      </div>

      <div className="pt-1 border-t border-gray-50 text-[11px] text-gray-500">
        {listing.contact_method}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Community Page
// ---------------------------------------------------------------------------

export default function Community({ isLoggedIn = false, currentUser = null }) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Posts state
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCrop, setFilterCrop] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterOrder, setFilterOrder] = useState('newest');
  const searchTimeout = useRef(null);

  // Post creation form
  const [newContent, setNewContent] = useState('');
  const [newCrop, setNewCrop] = useState('Paddy / Rice');
  const [newCategory, setNewCategory] = useState('general');
  const [newLocality, setNewLocality] = useState(currentUser?.village || '');
  const [newDistrict, setNewDistrict] = useState(currentUser?.district || '');
  const [newState, setNewState] = useState(currentUser?.state || '');
  const [newShowLocation, setNewShowLocation] = useState(true);
  const [newIsRental, setNewIsRental] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Notifications
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  // Machinery
  const [machinery, setMachinery] = useState([]);
  const [machineryLoading, setMachineryLoading] = useState(false);
  const [machinerySearch, setMachinerySearch] = useState('');
  const [showMachineryForm, setShowMachineryForm] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState('feed');

  // Prefill location from profile when it loads
  useEffect(() => {
    if (currentUser) {
      if (currentUser.village && !newLocality) setNewLocality(currentUser.village);
      if (currentUser.district && !newDistrict) setNewDistrict(currentUser.district);
      if (currentUser.state && !newState) setNewState(currentUser.state);
    }
  }, [currentUser]);

  // ---------------------------------------------------------------------------
  // Fetch posts
  // ---------------------------------------------------------------------------

  const fetchPosts = useCallback(async (params = {}, append = false) => {
    if (!append) setPostsLoading(true);
    setPostsError(null);
    try {
      const queryParams = {
        ...(filterCrop && { crop: filterCrop }),
        ...(filterCategory && { category: filterCategory }),
        ...(search && { search }),
        order: filterOrder,
        ...params,
      };
      const data = await api.community.getPosts(queryParams);
      const results = data.results ?? data;
      if (append) {
        setPosts((prev) => [...prev, ...results]);
      } else {
        setPosts(results);
      }
      setNextPage(data.next ?? null);
    } catch (err) {
      setPostsError(t('error_load_posts'));
    } finally {
      setPostsLoading(false);
      setLoadingMore(false);
    }
  }, [filterCrop, filterCategory, search, filterOrder]);

  useEffect(() => {
    fetchPosts();
  }, [filterCrop, filterCategory, filterOrder]);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchPosts();
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  function loadMore() {
    if (!nextPage) return;
    setLoadingMore(true);
    // Extract page number from next URL
    const url = new URL(nextPage);
    const page = url.searchParams.get('page');
    fetchPosts({ page }, true);
  }

  // ---------------------------------------------------------------------------
  // Fetch machinery
  // ---------------------------------------------------------------------------

  const fetchMachinery = useCallback(async () => {
    setMachineryLoading(true);
    try {
      const params = {};
      if (machinerySearch) params.search = machinerySearch;
      if (currentUser?.district) params.user_district = currentUser.district;
      const data = await api.community.getMachinery(params);
      setMachinery(data.results ?? data);
    } catch {
      setMachinery([]);
    } finally {
      setMachineryLoading(false);
    }
  }, [machinerySearch, currentUser]);

  useEffect(() => {
    if (activeTab === 'machinery') fetchMachinery();
  }, [activeTab, machinerySearch]);

  // ---------------------------------------------------------------------------
  // Post creation
  // ---------------------------------------------------------------------------

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast(t('image_invalid_type'), 'error');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showToast(t('image_too_large'), 'error');
      return;
    }
    setNewImage(file);
    setNewImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setNewImage(null);
    if (newImagePreview) URL.revokeObjectURL(newImagePreview);
    setNewImagePreview(null);
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!newContent.trim() || newContent.trim().length < 10) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('content', newContent.trim());
      fd.append('crop', newCrop);
      fd.append('category', newCategory);
      fd.append('locality', newLocality.trim());
      fd.append('district', newDistrict.trim());
      fd.append('state', newState.trim());
      fd.append('show_location', newShowLocation ? 'true' : 'false');
      fd.append('is_rental', newIsRental ? 'true' : 'false');
      fd.append('language', language);
      if (newImage) fd.append('image', newImage);

      const newPost = await api.community.createPost(fd);
      setPosts((prev) => [newPost, ...prev]);
      setNewContent('');
      setNewIsRental(false);
      removeImage();
      showToast(t('post_success'), 'success');
      setActiveTab('feed');
    } catch (err) {
      showToast(err.message || t('post_error'), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Interactions
  // ---------------------------------------------------------------------------

  async function handleHelpful(postId) {
    try {
      const res = await api.community.toggleHelpful(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, helpful_count: res.helpful_count, is_helpful_by_me: res.is_helpful_by_me }
            : p
        )
      );
    } catch {
      showToast(t('failed_update'), 'error');
    }
  }

  async function handleReply(postId, content) {
    const reply = await api.community.addReply(postId, content);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, reply_count: (p.reply_count ?? 0) + 1 }
          : p
      )
    );
    showToast(t('reply_success'), 'success');
    return reply;
  }

  async function handleReport(id, targetType, reason, description) {
    try {
      if (targetType === 'post') {
        await api.community.reportPost(id, reason, description);
      } else {
        await api.community.reportReply(id, reason, description);
      }
      showToast(t('report_success'), 'success');
    } catch {
      showToast(t('failed_report'), 'error');
    }
  }

  async function handleDelete(postId) {
    try {
      await api.community.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast(t('post_deleted'), 'success');
    } catch {
      showToast(t('failed_delete_post'), 'error');
    }
  }

  async function handleEdit(postId, newText) {
    try {
      const updated = await api.community.updatePost(postId, { content: newText });
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updated } : p)));
    } catch {
      showToast(t('failed_update'), 'error');
    }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 5000);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const tabs = [
    { id: 'feed', label: 'Community Feed' },
    { id: 'machinery', label: t('rental_spotlight_title') },
  ];

  return (
    <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-8 h-8 text-green-600" />
            {t('community_title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t('community_desc')}</p>
        </div>
        <button
          type="button"
          onClick={() => fetchPosts()}
          className="p-2.5 bg-white border border-gray-200 hover:bg-green-50 hover:text-green-700 text-gray-600 rounded-xl transition-colors shrink-0 self-start md:self-auto shadow-2xs"
          title="Refresh"
          aria-label="Refresh discussions"
        >
          <RefreshCw className={`w-4 h-4 ${postsLoading ? 'animate-spin text-green-600' : ''}`} />
        </button>
      </div>

      {/* Toast */}
      {toast.msg && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: 'success' })} />
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Machinery form modal */}
      {showMachineryForm && (
        <MachineryFormModal
          currentUser={currentUser}
          onClose={() => setShowMachineryForm(false)}
          onCreated={(listing) => {
            setMachinery((prev) => [listing, ...prev]);
            showToast(t('machinery_created'), 'success');
          }}
          t={t}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* FEED TAB                                                             */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'feed' && (
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main column (2 cols) */}
          <div className="lg:col-span-2 space-y-5">

            {/* Post creation or login gate */}
            {isLoggedIn ? (
              <form
                onSubmit={handleCreatePost}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4"
              >
                {/* Row 1: Crop + Category */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{t('crop_label')}</label>
                    <select
                      value={newCrop}
                      onChange={(e) => setNewCrop(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-green-600 outline-none bg-white"
                    >
                      {FORM_CROPS.map((c) => (
                        <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{t('category_label')}</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-green-600 outline-none bg-white"
                    >
                      {FORM_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Location */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-green-600" />
                    {t('location_label')}
                  </label>
                  <div className="grid sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newLocality}
                      onChange={(e) => setNewLocality(e.target.value)}
                      placeholder={t('locality_placeholder')}
                      className="p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none"
                    />
                    <input
                      type="text"
                      value={newDistrict}
                      onChange={(e) => setNewDistrict(e.target.value)}
                      placeholder={t('district_placeholder')}
                      className="p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none"
                    />
                    <input
                      type="text"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder={t('state_placeholder')}
                      className="p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newShowLocation}
                      onChange={(e) => setNewShowLocation(e.target.checked)}
                      className="rounded text-green-600 focus:ring-green-500"
                    />
                    {t('show_location_label')}
                  </label>
                </div>

                {/* Row 3: Content */}
                <div>
                  <textarea
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder={t('post_placeholder')}
                    maxLength={2000}
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                  />
                  <div className="flex justify-between items-center mt-0.5">
                    <span className={`text-[10px] ${newContent.length < 10 && newContent.length > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {newContent.length}/2000 {newContent.length > 0 && newContent.length < 10 && '(min 10 characters)'}
                    </span>
                  </div>
                </div>

                {/* Row 4: Image upload */}
                <div>
                  {newImagePreview ? (
                    <div className="relative inline-block">
                      <img src={newImagePreview} alt={t('image_preview')} className="h-28 rounded-xl object-cover" />
                      <button type="button" onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 shadow text-gray-600 hover:text-red-600"
                        aria-label={t('remove_image')}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 text-xs text-gray-500 cursor-pointer hover:border-green-500 hover:text-green-700 w-fit transition-colors">
                      <ImageIcon className="w-4 h-4" />
                      <span>{t('upload_image')}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>

                {/* Row 5: Rental checkbox + submit */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsRental}
                      onChange={(e) => setNewIsRental(e.target.checked)}
                      className="rounded text-green-600 focus:ring-green-500"
                    />
                    <Tractor className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('tag_machinery_rental')}</span>
                  </label>
                  <button
                    type="submit"
                    disabled={submitting || newContent.trim().length < 10}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    {submitting
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t('btn_posting')}</>
                      : <><Send className="w-3.5 h-3.5" />{t('btn_post_community')}</>
                    }
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-green-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{t('login_required_title')}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">{t('login_required_desc')}</p>
                  </div>
                </div>
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-bold rounded-xl shadow-xs whitespace-nowrap transition-all shrink-0"
                >
                  {t('btn_login_to_post')}
                </Link>
              </div>
            )}

            {/* Filters + Search */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none bg-white"
                />
              </div>
              {/* Crop filter */}
              <div className="relative">
                <select
                  value={filterCrop}
                  onChange={(e) => setFilterCrop(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-green-600 outline-none bg-white"
                  aria-label="Filter by crop"
                >
                  {CROPS.map((c) => (
                    <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
              {/* Category filter */}
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-green-600 outline-none bg-white"
                  aria-label="Filter by category"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{t(c.labelKey)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
              {/* Order */}
              <div className="relative">
                <select
                  value={filterOrder}
                  onChange={(e) => setFilterOrder(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-green-600 outline-none bg-white"
                  aria-label="Sort discussions"
                >
                  <option value="newest">{t('filter_newest')}</option>
                  <option value="helpful">{t('filter_most_helpful')}</option>
                  <option value="discussed">{t('filter_most_discussed')}</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Posts list */}
            {postsLoading && posts.length === 0 ? (
              <PageLoader variant="posts" label={t('loading_posts')} />
            ) : postsError ? (
              <div className="py-10 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                <p className="text-sm text-red-600">{postsError}</p>
                <button
                  type="button"
                  onClick={() => fetchPosts()}
                  className="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700"
                >
                  {t('try_again')}
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-14 text-center bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 px-6">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-base">{t('empty_posts')}</p>
                  <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">{t('empty_posts_sub')}</p>
                </div>
                {!isLoggedIn && (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                  >
                    {t('btn_login_to_post')}
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    isLoggedIn={isLoggedIn}
                    onHelpful={handleHelpful}
                    onReply={handleReply}
                    onReport={handleReport}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    t={t}
                  />
                ))}

                {/* Load more */}
                {nextPage && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-green-50 hover:border-green-300 text-xs font-semibold text-gray-700 rounded-xl transition-colors inline-flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t('loading_more')}</>
                      ) : (
                        <>{t('load_more')}<ChevronRight className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Machinery Spotlight */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-5 space-y-3">
              <div className="flex items-center gap-2 text-green-800 font-bold text-sm">
                <Tractor className="w-5 h-5 text-green-600" />
                {t('rental_spotlight_title')}
              </div>
              <p className="text-xs text-green-950 leading-relaxed">
                {t('rental_spotlight_desc')}
              </p>
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => { setActiveTab('machinery'); setShowMachineryForm(true); }}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  {t('btn_list_equipment')}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-block text-center w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  {t('btn_login_list_equipment')}
                </Link>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('machinery')}
                className="w-full py-2 border border-green-300 text-green-700 hover:bg-green-100 rounded-xl text-xs font-semibold transition-colors"
              >
                {t('machinery_section_title')} →
              </button>
            </div>

            {/* Community Rules */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2 text-xs text-gray-500">
              <p className="font-bold text-gray-800">{t('community_rules_title')}</p>
              <p>{t('rule_1')}</p>
              <p>{t('rule_2')}</p>
              <p>{t('rule_3')}</p>
              <p>{t('rule_4')}</p>
              <p>{t('rule_5')}</p>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MACHINERY TAB                                                        */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'machinery' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Tractor className="w-6 h-6 text-green-600" />
                {t('machinery_section_title')}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{t('machinery_section_desc')}</p>
            </div>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setShowMachineryForm(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                {t('btn_list_equipment')}
              </button>
            ) : (
              <Link to="/login"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0">
                {t('btn_login_list_equipment')}
              </Link>
            )}
          </div>

          {/* Machinery search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={machinerySearch}
              onChange={(e) => setMachinerySearch(e.target.value)}
              placeholder={t('machinery_search_placeholder')}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-green-600 outline-none bg-white"
            />
          </div>

          {machineryLoading ? (
            <PageLoader variant="cards" label={t('loading_more')} count={3} />
          ) : machinery.length === 0 ? (
            <div className="py-14 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 px-6">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                <Tractor className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-base">{t('empty_machinery')}</p>
                {isLoggedIn && (
                  <p className="text-sm text-gray-500 mt-1">{t('btn_list_equipment')} →</p>
                )}
              </div>
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => setShowMachineryForm(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  {t('btn_list_equipment')}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  {t('btn_login_list_equipment')}
                </Link>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {machinery.map((listing) => (
                <MachineryCard key={listing.id} listing={listing} t={t} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
