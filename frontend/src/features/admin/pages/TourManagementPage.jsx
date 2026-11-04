import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { adminService, categoryService } from '@/services/tourService';
import { getImageUrl } from '@/utils/imageUrl';
import { getTourSourcePayload, ROOT_CONTENT_FIELDS } from '@/features/admin/utils/tourSourcePayload';
import { getTourTranslationPayload } from '@/features/admin/utils/tourTranslationPayload';
import AdminLayout from '@/components/layout/AdminLayout';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import DepartureCalendar from '@/components/ui/DepartureCalendar';
import SearchBar from '@/components/ui/SearchBar';
import TourManagementTable from '@/features/admin/components/TourManagementTable';
import TranslationToolbar from '@/features/admin/components/TranslationToolbar';
import {
  Plus,
  Trash2,
  Loader2,
  X,
  Upload,
  Calendar,
  Settings,
  List,
  Navigation,
  ChevronLeft,
  ChevronRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Frame,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const getTodayDateOnly = () => {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
};

const normalizeDateOnly = (date) => (date ? String(date).slice(0, 10) : '');

const normalizeTimeValue = (value) => {
  const match = String(value || '').match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : '';
};

const normalizeMoneyValue = (value) => {
  if (value === null || value === undefined || value === '') return 0;

  const digits = String(value).replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
};

const normalizeIntegerValue = (value) => {
  const digits = String(value ?? '').replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
};

const formatMoneyDisplayValue = (value) => {
  if (value === null || value === undefined || value === '') return '';

  const numericValue = normalizeMoneyValue(value);
  return numericValue ? numericValue.toLocaleString('vi-VN') : '0';
};

const sanitizeMoneyDisplayInput = (value) => String(value || '').replace(/[^\d.]/g, '');

const TIME_DISPLAY_OPTIONS = Array.from({ length: 24 * 4 }, (_, index) => {
  const totalMinutes = index * 15;
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;

  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
});

const formatTimeDisplayValue = (value) => {
  const normalizedTime = normalizeTimeValue(value);
  if (!normalizedTime) return '';

  const [hour, minute] = normalizedTime.split(':');
  const hourNumber = Number(hour);
  const period = hourNumber >= 12 ? 'PM' : 'AM';
  const hour12 = hourNumber % 12 || 12;

  return `${String(hour12).padStart(2, '0')}:${minute} ${period}`;
};

const parseTimeDisplayValue = (value) => {
  const match = String(value || '')
    .trim()
    .toUpperCase()
    .match(/^(\d{1,2})(?::?(\d{2}))?\s*(AM|PM)$/);

  if (!match) return '';

  const hour12 = Number(match[1]);
  const minute = Number(match[2] || '00');
  if (hour12 < 1 || hour12 > 12 || minute < 0 || minute > 59) return '';

  const hour24 = match[3] === 'PM' ? (hour12 % 12) + 12 : hour12 % 12;

  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const isDateBeforeToday = (date) => {
  const dateOnly = normalizeDateOnly(date);
  return !!dateOnly && dateOnly < getTodayDateOnly();
};

// ═══ TAB NAVIGATION ═══
const TABS = [
  { key: 'general', label: 'Thông tin chung', icon: Settings },
  { key: 'itineraries', label: 'Lịch trình', icon: List },
  { key: 'departures', label: 'Lịch khởi hành', icon: Calendar },
  { key: 'pickups', label: 'Điểm đón', icon: Navigation },
  { key: 'options', label: 'Tùy chọn', icon: Settings },
];

const normalizeAdminTranslationLanguage = (language) => {
  const normalized = String(language || '')
    .trim()
    .toLowerCase();
  if (normalized.startsWith('zh')) return 'zh';
  if (normalized.startsWith('en')) return 'en';
  return normalized;
};

const DEFAULT_TRANSLATION_LANGUAGES = ['en', 'zh'];

const getTranslationLangIndex = (language, translations = []) => {
  const normalizedLanguage = normalizeAdminTranslationLanguage(language);
  if (!normalizedLanguage || normalizedLanguage === 'vi') return -1;

  const existingIndex = (translations || []).findIndex(
    (item) => normalizeAdminTranslationLanguage(item?.language) === normalizedLanguage
  );

  if (existingIndex >= 0) return existingIndex;

  const defaultIndex = DEFAULT_TRANSLATION_LANGUAGES.indexOf(normalizedLanguage);
  return defaultIndex >= 0 ? defaultIndex : -1;
};


const getSafeTranslationLangIndex = (language, translations = []) => {
  const langIndex = getTranslationLangIndex(language, translations);
  if (langIndex >= 0) return langIndex;
  return normalizeAdminTranslationLanguage(language) === 'zh' ? 1 : 0;
};

const getTranslationDisplayName = (language) =>
  normalizeAdminTranslationLanguage(language) === 'zh' ? 'Tiếng Trung' : 'English';


const REQUIRED_VI_TOUR_FIELDS = [
  ['title', 'Ten tour khong duoc de trong'],
  ['summary', 'Tom tat khong duoc de trong'],
  ['highlights', 'Vui long nhap diem noi bat'],
  ['price_includes', 'Vui long nhap thong tin gia bao gom'],
  ['price_excludes', 'Vui long nhap thong tin gia khong bao gom'],
  ['terms_and_notes', 'Vui long nhap dieu khoan'],
  ['cancellation_policy', 'Vui long nhap chinh sach hoan huy'],
];

const REQUIRED_VI_ITINERARY_FIELDS = [
  ['title', 'Nhap tieu de ngay'],
  ['content', 'Nhap noi dung hoat dong'],
];

const isMeaningfulText = (value) =>
  String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim().length > 0;

const findMissingVietnameseContent = (data) => {
  const missingTourField = REQUIRED_VI_TOUR_FIELDS.find(
    ([field]) => !isMeaningfulText(data[field])
  );
  if (missingTourField) {
    return { tab: 'general', path: missingTourField[0], message: missingTourField[1] };
  }

  const itineraries = data.itineraries || [];
  for (const [index, itinerary] of itineraries.entries()) {
    const missingItineraryField = REQUIRED_VI_ITINERARY_FIELDS.find(
      ([field]) => !isMeaningfulText(itinerary[field])
    );
    if (missingItineraryField) {
      return {
        tab: 'itineraries',
        path: `itineraries.${index}.${missingItineraryField[0]}`,
        message: `Ngay ${index + 1}: ${missingItineraryField[1]}`,
      };
    }
  }

  return null;
};

const isTranslationRateLimited = (error) => error?.response?.status === 429;

const isTranslationTimeout = (error) =>
  error?.code === 'ECONNABORTED' ||
  String(error?.message || '')
    .toLowerCase()
    .includes('timeout');

const getTranslationServerMessage = (error) => {
  const message = error?.response?.data?.message;
  return typeof message === 'string' ? message : '';
};

const TRANSLATION_RATE_LIMIT_COOLDOWN_MS = 2 * 60 * 1000;

const getEmptyTourTranslation = (language) => ({
  language,
  title: '',
  summary: '',
  highlights: '',
  price_includes: '',
  price_excludes: '',
  terms_and_notes: '',
  cancellation_policy: '',
});

const getEmptyItineraryTranslation = (language) => ({
  language,
  title: '',
  content: '',
});

const mergeTranslationsByLanguage = (defaults, translations = []) =>
  defaults.map((defaultTranslation) => {
    const found = (translations || []).find(
      (item) => normalizeAdminTranslationLanguage(item?.language) === defaultTranslation.language
    );
    return found
      ? { ...defaultTranslation, ...found, language: defaultTranslation.language }
      : defaultTranslation;
  });

const normalizeTourDeparturesPayload = (departures = []) =>
  departures.map(({ available_seats, status: _status, ...item }) => ({
    ...item,
    departure_date: normalizeDateOnly(item.departure_date),
    price_adult: normalizeMoneyValue(item.price_adult),
    price_child: normalizeMoneyValue(item.price_child),
    price_infant: normalizeMoneyValue(item.price_infant),
    capacity: normalizeIntegerValue(item.capacity ?? available_seats),
  }));

const normalizePickupLocationsPayload = (pickupLocations = []) =>
  pickupLocations.map((item) => ({
    ...item,
    location_name: String(item.location_name || '').trim(),
    pickup_time: normalizeTimeValue(item.pickup_time),
    surcharge_amount: normalizeMoneyValue(item.surcharge_amount),
  }));

const normalizeTourOptionsPayload = (options = []) =>
  options
    .filter((item) => String(item.option_name || '').trim() !== '')
    .map((item) => ({
      ...item,
      option_name: String(item.option_name || '').trim(),
      price: normalizeMoneyValue(item.price),
      charge_type: item.charge_type || 'quantity',
    }));

const BULLET_LIBRARY = [
  { label: 'None', symbol: '', title: 'Bỏ bullet' },
  { label: '–', symbol: '– ', title: 'Dấu gạch ngang' },
  { label: '•', symbol: '• ', title: 'Dấu chấm tròn' },
  { label: '○', symbol: '○ ', title: 'Dấu tròn rỗng' },
  { label: '■', symbol: '■ ', title: 'Dấu hình vuông' },
  { label: '❖', symbol: '❖ ', title: 'Dấu kim cương' },
  { label: '➢', symbol: '➢ ', title: 'Dấu mũi tên' },
  { label: '✓', symbol: '✓ ', title: 'Dấu tích' },
];

// ═══ RICH TEXT EDITOR WRAPPER ═══
const RichTextEditor = ({ value, onChange, label, placeholder, error }) => {
  const [ReactQuill, setReactQuill] = useState(null);
  const quillRef = useRef(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const [imgAlign, setImgAlign] = useState('inline');
  const [imgSize, setImgSize] = useState('100%');
  const [hasFrame, setHasFrame] = useState(false);

  useEffect(() => {
    import('react-quill-new').then((mod) => {
      const Quill = mod.Quill || mod.default?.Quill;
      if (Quill) {
        try {
          const BaseImage = Quill.import('formats/image');
          if (BaseImage) {
            const ATTRIBUTES = ['alt', 'height', 'width', 'style', 'class', 'data-align'];
            class CustomImage extends BaseImage {
              static formats(domNode) {
                return ATTRIBUTES.reduce((formats, attribute) => {
                  if (domNode.hasAttribute(attribute)) {
                    formats[attribute] = domNode.getAttribute(attribute);
                  }
                  return formats;
                }, {});
              }
              format(name, value) {
                if (ATTRIBUTES.includes(name)) {
                  if (value) {
                    this.domNode.setAttribute(name, value);
                  } else {
                    this.domNode.removeAttribute(name);
                  }
                } else {
                  super.format(name, value);
                }
              }
            }
            Quill.register(CustomImage, true);
          }
        } catch (e) {
          console.warn('Could not register CustomImage on Quill', e);
        }
      }
      setReactQuill(() => mod.default);
    });
    import('react-quill-new/dist/quill.snow.css');
  }, []);

  const updateActiveImageState = (img) => {
    if (!img) return;
    const style = img.style || {};

    // Check align
    if (style.float === 'right') {
      setImgAlign('right');
    } else if (style.float === 'left') {
      setImgAlign('left');
    } else if (style.display === 'block' && String(style.margin || '').includes('auto')) {
      setImgAlign('center');
    } else {
      setImgAlign('inline');
    }

    // Check size
    const maxWidth = style.maxWidth || style.width || '';
    if (maxWidth === '25%') setImgSize('25%');
    else if (maxWidth === '40%' || maxWidth === '45%') setImgSize('40%');
    else if (maxWidth === '60%') setImgSize('60%');
    else if (maxWidth === '100%') setImgSize('100%');
    else setImgSize('custom');

    // Check frame
    const hasShadow = !!(style.boxShadow && style.boxShadow.includes('rgba'));
    setHasFrame(hasShadow);
  };

  const triggerChange = useCallback((targetImg) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    if (targetImg) targetImg.classList.remove('ql-selected-image');
    const html = editor.root.innerHTML;
    if (targetImg) targetImg.classList.add('ql-selected-image');
    onChange(html);
  }, [onChange]);

  const applyAlignment = (align) => {
    if (!selectedImg) return;
    if (align === 'right') {
      selectedImg.style.float = 'right';
      selectedImg.style.display = 'inline-block';
      selectedImg.style.margin = '4px 0 14px 18px';
      selectedImg.style.clear = 'none';
      if (!selectedImg.style.maxWidth || selectedImg.style.maxWidth === '100%') {
        selectedImg.style.maxWidth = '40%';
      }
    } else if (align === 'left') {
      selectedImg.style.float = 'left';
      selectedImg.style.display = 'inline-block';
      selectedImg.style.margin = '4px 18px 14px 0';
      selectedImg.style.clear = 'none';
      if (!selectedImg.style.maxWidth || selectedImg.style.maxWidth === '100%') {
        selectedImg.style.maxWidth = '40%';
      }
    } else if (align === 'center') {
      selectedImg.style.float = 'none';
      selectedImg.style.display = 'block';
      selectedImg.style.margin = '14px auto';
      selectedImg.style.clear = 'both';
      if (!selectedImg.style.maxWidth || selectedImg.style.maxWidth === '40%') {
        selectedImg.style.maxWidth = '75%';
      }
    } else {
      // inline / default
      selectedImg.style.float = 'none';
      selectedImg.style.display = 'inline-block';
      selectedImg.style.margin = '6px 0';
      selectedImg.style.clear = 'none';
    }
    selectedImg.setAttribute('style', selectedImg.style.cssText);
    updateActiveImageState(selectedImg);
    triggerChange(selectedImg);
  };

  const applySize = (size) => {
    if (!selectedImg) return;
    selectedImg.style.maxWidth = size;
    selectedImg.style.width = 'auto';
    selectedImg.setAttribute('style', selectedImg.style.cssText);
    updateActiveImageState(selectedImg);
    triggerChange(selectedImg);
  };

  const toggleFrame = () => {
    if (!selectedImg) return;
    if (hasFrame) {
      selectedImg.style.border = '';
      selectedImg.style.boxShadow = '';
      selectedImg.style.borderRadius = '6px';
    } else {
      selectedImg.style.border = '4px solid #ffffff';
      selectedImg.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
      selectedImg.style.borderRadius = '4px';
    }
    selectedImg.setAttribute('style', selectedImg.style.cssText);
    updateActiveImageState(selectedImg);
    triggerChange(selectedImg);
  };

  const deleteSelectedImage = () => {
    if (!selectedImg) return;
    const editor = quillRef.current?.getEditor();
    selectedImg.classList.remove('ql-selected-image');
    selectedImg.remove();
    setSelectedImg(null);
    if (editor) {
      onChange(editor.root.innerHTML);
    }
  };

  const uploadAndInsertImage = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const editor = quillRef.current?.getEditor();
    const range = editor?.getSelection(true) || { index: editor?.getLength() || 0, length: 0 };

    try {
      const res = await adminService.uploadGuideImage(formData);
      const imageUrl = getImageUrl(res.data?.data?.image_url);
      if (editor && imageUrl) {
        editor.insertEmbed(range.index, 'image', imageUrl, 'user');
        editor.setSelection(range.index + 1);
        toast.success('Đã dán và tải ảnh lên thành công');
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (editor && evt.target?.result) {
          editor.insertEmbed(range.index, 'image', evt.target.result, 'user');
          editor.setSelection(range.index + 1);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const insertBulletSymbol = useCallback((symbol) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const range = editor.getSelection(true) || { index: 0, length: 0 };
    if (symbol === '') {
      const [line] = editor.getLine(range.index);
      if (line) {
        const lineText = line.domNode?.textContent || '';
        const cleanedText = lineText.replace(/^[-*•○■❖➢✓]\s*/, '');
        const lineIndex = editor.getIndex(line);
        editor.deleteText(lineIndex, lineText.length);
        editor.insertText(lineIndex, cleanedText);
      }
      return;
    }

    editor.insertText(range.index, symbol, 'user');
    editor.setSelection(range.index + symbol.length);
  }, []);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      uploadAndInsertImage(file);
    };

    input.click();
  }, [uploadAndInsertImage]);

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'indent',
    'link',
    'image',
    'color',
    'background',
    'align',
    'width',
    'height',
    'style',
  ];

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: handleImageUpload,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [handleImageUpload]
  );

  // Lắng nghe sự kiện paste ở chế độ CAPTURE trên editor.root để ngăn Quill chèn ảnh base64 trùng lặp
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor || !editor.root) return;

    const root = editor.root;

    const handlePasteCapture = (e) => {
      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      if (!items || items.length === 0) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            // Ngăn chặn hoàn toàn Quill xử lý paste nội bộ thành ảnh base64 duplicate
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            uploadAndInsertImage(file);
            return;
          }
        }
      }
    };

    const handleEditorClick = (e) => {
      const target = e.target;
      if (target && target.tagName === 'IMG') {
        e.stopPropagation();
        setSelectedImg(target);
        updateActiveImageState(target);
      } else {
        setSelectedImg(null);
      }
    };

    root.addEventListener('paste', handlePasteCapture, true);
    root.addEventListener('click', handleEditorClick);

    return () => {
      root.removeEventListener('paste', handlePasteCapture, true);
      root.removeEventListener('click', handleEditorClick);
    };
  }, [ReactQuill, uploadAndInsertImage]);

  // Hiển thị viền highlight cho ảnh đang được chọn
  useEffect(() => {
    if (selectedImg) {
      selectedImg.classList.add('ql-selected-image');
    }
    return () => {
      if (selectedImg) {
        selectedImg.classList.remove('ql-selected-image');
      }
    };
  }, [selectedImg]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        {label && (
          <label className="text-sm font-medium text-text block">
            {label}{' '}
            {error && <span className="text-error text-xs font-normal ml-1">({error})</span>}
          </label>
        )}
      </div>

      {/* ═══ BULLET LIBRARY BAR ═══ */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2 bg-surface-alt/70 p-1.5 rounded-lg border border-border/60">
        <span className="text-[11px] font-bold text-text-muted px-1 uppercase tracking-wider">
          Bullet Library:
        </span>
        {BULLET_LIBRARY.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => insertBulletSymbol(item.symbol)}
            title={item.title}
            className="h-7 px-2 flex items-center justify-center bg-surface border border-border/80 hover:border-primary hover:bg-primary/10 hover:text-primary text-xs font-bold rounded-md shadow-2xs transition-all cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ═══ IMAGE FORMATTING TOOLBAR (WORD STYLE) ═══ */}
      {selectedImg ? (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 bg-primary/10 border-2 border-primary/40 p-2 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wide bg-primary/15 px-2 py-1 rounded-md">
              <ImageIcon className="w-3.5 h-3.5" /> Bố cục ảnh (Word):
            </span>

            {/* Căn lề / Trôi chữ */}
            <div className="flex items-center gap-1 bg-surface p-0.5 rounded-lg border border-border shadow-2xs">
              <button
                type="button"
                onClick={() => applyAlignment('right')}
                className={`h-7 px-2.5 flex items-center gap-1.5 text-xs font-bold rounded-md transition-all ${
                  imgAlign === 'right'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text hover:bg-surface-hover hover:text-primary'
                }`}
                title="Trôi sang phải (Chữ bao quanh bên trái — như mẫu Word)"
              >
                <AlignRight className="w-3.5 h-3.5" />
                <span>Trôi phải</span>
              </button>
              <button
                type="button"
                onClick={() => applyAlignment('left')}
                className={`h-7 px-2.5 flex items-center gap-1.5 text-xs font-bold rounded-md transition-all ${
                  imgAlign === 'left'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text hover:bg-surface-hover hover:text-primary'
                }`}
                title="Trôi sang trái (Chữ bao quanh bên phải)"
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Trôi trái</span>
              </button>
              <button
                type="button"
                onClick={() => applyAlignment('center')}
                className={`h-7 px-2.5 flex items-center gap-1.5 text-xs font-bold rounded-md transition-all ${
                  imgAlign === 'center'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text hover:bg-surface-hover hover:text-primary'
                }`}
                title="Căn giữa (Tách riêng 1 hàng)"
              >
                <AlignCenter className="w-3.5 h-3.5" />
                <span>Giữa</span>
              </button>
              <button
                type="button"
                onClick={() => applyAlignment('inline')}
                className={`h-7 px-2 flex items-center gap-1 text-xs font-bold rounded-md transition-all ${
                  imgAlign === 'inline'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text hover:bg-surface-hover hover:text-primary'
                }`}
                title="Mặc định (Nằm cùng dòng text)"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Kích thước */}
            <div className="flex items-center gap-1 bg-surface p-0.5 rounded-lg border border-border shadow-2xs">
              <span className="text-[10px] font-bold text-text-muted px-1.5">Size:</span>
              {[
                { label: '25%', val: '25%' },
                { label: '40%', val: '40%' },
                { label: '60%', val: '60%' },
                { label: '100%', val: '100%' },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => applySize(s.val)}
                  className={`h-7 px-2 text-xs font-bold rounded-md transition-all ${
                    imgSize === s.val
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text hover:bg-surface-hover hover:text-primary'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Khung ảnh nghệ thuật */}
            <button
              type="button"
              onClick={toggleFrame}
              className={`h-8 px-2.5 flex items-center gap-1.5 text-xs font-bold rounded-lg border transition-all ${
                hasFrame
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-surface text-text border-border hover:border-amber-500 hover:text-amber-600'
              }`}
              title="Bật/Tắt khung viền trắng và bóng đổ nghệ thuật"
            >
              <Frame className="w-3.5 h-3.5" />
              <span>Khung ảnh {hasFrame ? '✓' : ''}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={deleteSelectedImage}
              className="h-8 px-2.5 flex items-center gap-1 text-xs font-bold rounded-lg bg-error/10 text-error hover:bg-error hover:text-white border border-error/20 transition-all"
              title="Xóa hình ảnh này"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa ảnh</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedImg(null)}
              className="h-8 px-2 flex items-center justify-center rounded-lg bg-surface text-text-muted hover:text-text border border-border hover:bg-surface-hover transition-all text-xs font-bold"
              title="Đóng thanh công cụ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-[11px] text-text-muted mb-2 px-1">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            <span>Mẹo: Nhấp chuột vào bất kỳ hình ảnh nào trong bài để mở thanh căn chỉnh (Trôi phải, trôi trái kiểu Word, kích thước, khung viền...)</span>
          </span>
        </div>
      )}

      <div
        className={`rounded-lg border transition-colors duration-200 ${error ? 'border-error ring-1 ring-error/20' : 'border-transparent'}`}
      >
        {ReactQuill ? (
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            formats={formats}
            modules={modules}
            className="bg-transparent rounded-lg [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:rounded-b-xl [&_.ql-editor]:min-h-[140px]"
          />
        ) : (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder={placeholder}
          />
        )}
      </div>
    </div>
};

const PriceInputField = ({ field, error, placeholder }) => {
  const [displayValue, setDisplayValue] = useState(formatMoneyDisplayValue(field.value));
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setDisplayValue(formatMoneyDisplayValue(field.value));
    }
  }, [field.value]);

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onFocus={() => {
        isFocusedRef.current = true;
      }}
      onChange={(e) => {
        const sanitizedValue = sanitizeMoneyDisplayInput(e.target.value);
        const digits = sanitizedValue.replace(/[^\d]/g, '');

        setDisplayValue(digits === '' ? '' : formatMoneyDisplayValue(digits));
        field.onChange(digits === '' ? '' : Number(digits));
      }}
      onBlur={(e) => {
        isFocusedRef.current = false;
        field.onBlur(e);
        setDisplayValue(formatMoneyDisplayValue(e.target.value));
      }}
      className={`w-full px-3 py-2 bg-surface border ${error ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-lg text-sm focus:outline-none focus:ring-2 transition-all`}
      placeholder={placeholder}
    />
  );
};

const PriceInput = ({ control, name, rules, error, placeholder }) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field }) => (
      <PriceInputField field={field} error={error} placeholder={placeholder} />
    )}
  />
);

const TimeInputField = ({ field, error, name }) => {
  const [displayValue, setDisplayValue] = useState(formatTimeDisplayValue(field.value));
  const datalistId = `${name.replace(/[^a-zA-Z0-9_-]/g, '-')}-options`;
  const inputClassName = `w-full px-3 py-2 bg-surface border ${error ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-lg text-sm font-medium focus:outline-none focus:ring-2 transition-all`;

  useEffect(() => {
    setDisplayValue(formatTimeDisplayValue(field.value));
  }, [field.value]);

  const commitDisplayValue = (value) => {
    const normalizedTime = parseTimeDisplayValue(value);
    field.onChange(normalizedTime);
    setDisplayValue(normalizedTime ? formatTimeDisplayValue(normalizedTime) : value);
  };

  return (
    <>
      <input
        type="text"
        list={datalistId}
        value={displayValue}
        onChange={(event) => {
          setDisplayValue(event.target.value);
          const normalizedTime = parseTimeDisplayValue(event.target.value);
          if (normalizedTime) {
            field.onChange(normalizedTime);
          }
        }}
        onBlur={(event) => {
          field.onBlur(event);
          commitDisplayValue(event.target.value);
        }}
        className={inputClassName}
        placeholder="04:00 AM"
      />
      <datalist id={datalistId}>
        {TIME_DISPLAY_OPTIONS.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
};

const TimeInput = ({ control, name, rules, error }) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({ field }) => <TimeInputField field={field} error={error} name={name} />}
  />
);

// ═══ TAB: THÔNG TIN CHUNG ═══
const GeneralTab = ({
  register,
  watch,
  setValue,
  categories,
  modal,
  files,
  setFiles,
  handleDeleteImage,
  errors,
  control,
  currentLang,
}) => {
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ label: c.name, value: String(c.id) })),
    [categories]
  );
  const statusOptions = [
    { label: 'Hoạt động', value: 'active' },
    { label: 'Ẩn', value: 'hidden' },
    { label: 'Hết chỗ', value: 'sold_out' },
  ];
  const badgeOptions = [
    { label: 'Không có', value: 'none' },
    { label: 'Nổi bật', value: 'featured' },
    { label: 'Khuyến mãi', value: 'promotion' },
  ];

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const getFieldName = (name) => {
    if (currentLang === 'vi') return name;
    const safeLangIndex = getSafeTranslationLangIndex(currentLang, watch('translations') || []);
    return `translations.${safeLangIndex}.${name}`;
  };

  const getFieldError = (name) => {
    if (currentLang === 'vi') return errors[name];
    const safeLangIndex = getSafeTranslationLangIndex(currentLang, watch('translations') || []);
    return errors?.translations?.[safeLangIndex]?.[name];
  };
  const getRequiredRule = (message) => (currentLang === 'vi' ? { required: message } : {});

  return (
    <div className="space-y-5">
      {/* Category & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="[&>div>button]:py-2.5 [&>div>button]:bg-surface-alt">
          <label className="text-sm font-medium text-text mb-1 block">Danh mục *</label>
          <Controller
            name="category_id"
            control={control}
            rules={{ required: 'Vui lòng chọn danh mục' }}
            render={({ field }) => (
              <CustomSelect
                value={String(field.value)}
                onChange={field.onChange}
                options={categoryOptions}
                placeholder="Chọn danh mục"
              />
            )}
          />
          {errors.category_id && (
            <p className="text-error text-xs mt-1 font-medium">{errors.category_id.message}</p>
          )}
        </div>
        <div className="[&>div>button]:py-2.5 [&>div>button]:bg-surface-alt">
          <label className="text-sm font-medium text-text mb-1 block">Trạng thái *</label>
          <Controller
            name="status"
            control={control}
            rules={{ required: 'Vui lòng chọn trạng thái' }}
            render={({ field }) => (
              <CustomSelect
                value={field.value}
                onChange={field.onChange}
                options={statusOptions}
                placeholder="Chọn trạng thái"
              />
            )}
          />
          {errors.status && (
            <p className="text-error text-xs mt-1 font-medium">{errors.status.message}</p>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-sm font-medium text-text mb-1 block">
          Tên tour ({currentLang.toUpperCase()}) *
        </label>
        <input
          key={`title-${currentLang}`}
          {...register(getFieldName('title'), getRequiredRule('Tên tour không được để trống'))}
          className={`w-full px-3 py-2.5 bg-surface-alt border ${getFieldError('title') ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-lg text-sm focus:outline-none focus:ring-2 transition-all`}
          placeholder="Nhập tên tour..."
        />
        {getFieldError('title') && (
          <p className="text-error text-xs mt-1 font-medium">{getFieldError('title').message}</p>
        )}
      </div>

      {/* Summary */}
      <div>
        <label className="text-sm font-medium text-text mb-1 block">
          Tóm tắt ({currentLang.toUpperCase()}) *
        </label>
        <textarea
          key={`summary-${currentLang}`}
          {...register(getFieldName('summary'), getRequiredRule('Tóm tắt không được để trống'))}
          rows={2}
          className={`w-full px-3 py-2.5 bg-surface-alt border ${getFieldError('summary') ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-lg text-sm focus:outline-none focus:ring-2 transition-all resize-none`}
          placeholder="Mô tả ngắn gọn về tour..."
        />
        {getFieldError('summary') && (
          <p className="text-error text-xs mt-1 font-medium">{getFieldError('summary').message}</p>
        )}
      </div>

      {/* Duration */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-text mb-1 block">Số ngày *</label>
          <input
            type="number"
            {...register('duration_days', {
              required: 'Nhập số ngày',
              min: { value: 1, message: 'Tối thiểu 1 ngày' },
            })}
            className={`w-full px-3 py-2.5 bg-surface-alt border ${errors.duration_days ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-lg text-sm focus:outline-none focus:ring-2 transition-all`}
            placeholder="VD: 3"
          />
          {errors.duration_days && (
            <p className="text-error text-xs mt-1 font-medium">{errors.duration_days.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-text mb-1 block">Số đêm *</label>
          <input
            type="number"
            {...register('duration_nights', {
              required: 'Nhập số đêm',
              min: { value: 0, message: 'Tối thiểu 0 đêm' },
              max: { value: 30, message: 'Tối đa 30 đêm' },
            })}
            className={`w-full px-3 py-2.5 bg-surface-alt border ${errors.duration_nights ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-lg text-sm focus:outline-none focus:ring-2 transition-all`}
            placeholder="VD: 2"
          />
          {errors.duration_nights && (
            <p className="text-error text-xs mt-1 font-medium">{errors.duration_nights.message}</p>
          )}
        </div>
        <div className="[&>div>button]:py-2.5 [&>div>button]:bg-surface-alt">
          <label className="text-sm font-medium text-text mb-1 block">Nhãn tour</label>
          <Controller
            name="tour_badge"
            control={control}
            render={({ field }) => (
              <CustomSelect
                value={field.value}
                onChange={field.onChange}
                options={badgeOptions}
                placeholder="Chọn nhãn"
              />
            )}
          />
        </div>
      </div>

      {/* 5 Rich Text Fields */}
      <div className="space-y-6 pt-2">
        <div>
          <label className="text-sm font-medium text-text mb-1 block">
            Điểm nổi bật ({currentLang.toUpperCase()}) *
          </label>
          <textarea
            key={`highlights-${currentLang}`}
            {...register(getFieldName('highlights'), getRequiredRule('Vui lòng nhập điểm nổi bật'))}
            rows={4}
            className={`w-full px-3 py-2.5 bg-surface-alt border ${getFieldError('highlights') ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-lg text-sm focus:outline-none focus:ring-2 transition-all resize-none`}
            placeholder="Nhập các điểm nổi bật... (Lưu ý: Viết thành đoạn văn, mỗi điểm nổi bật kết thúc bằng 1 dấu chấm)"
          />
          {getFieldError('highlights') && (
            <p className="text-error text-xs mt-1 font-medium">
              {getFieldError('highlights').message}
            </p>
          )}
        </div>

        <div>
          <RichTextEditor
            key={`price_includes-${currentLang}`}
            value={watch(getFieldName('price_includes'))}
            onChange={(val) =>
              setValue(getFieldName('price_includes'), val, { shouldValidate: true })
            }
            label={`Giá tour bao gồm (${currentLang.toUpperCase()}) *`}
            placeholder="Vé tham quan, khách sạn, xe đưa đón..."
            error={getFieldError('price_includes')?.message}
          />
          <input
            type="hidden"
            {...register(
              getFieldName('price_includes'),
              getRequiredRule('Vui lòng nhập thông tin giá bao gồm')
            )}
          />
        </div>

        <div>
          <RichTextEditor
            key={`price_excludes-${currentLang}`}
            value={watch(getFieldName('price_excludes'))}
            onChange={(val) =>
              setValue(getFieldName('price_excludes'), val, { shouldValidate: true })
            }
            label={`Giá tour không bao gồm (${currentLang.toUpperCase()}) *`}
            placeholder="Chi phí cá nhân, tip HDV..."
            error={getFieldError('price_excludes')?.message}
          />
          <input
            type="hidden"
            {...register(
              getFieldName('price_excludes'),
              getRequiredRule('Vui lòng nhập thông tin giá không bao gồm')
            )}
          />
        </div>

        <div>
          <RichTextEditor
            key={`terms_and_notes-${currentLang}`}
            value={watch(getFieldName('terms_and_notes'))}
            onChange={(val) =>
              setValue(getFieldName('terms_and_notes'), val, { shouldValidate: true })
            }
            label={`Điều khoản và lưu ý (${currentLang.toUpperCase()}) *`}
            placeholder="Quy định, lưu ý quan trọng..."
            error={getFieldError('terms_and_notes')?.message}
          />
          <input
            type="hidden"
            {...register(
              getFieldName('terms_and_notes'),
              getRequiredRule('Vui lòng nhập điều khoản')
            )}
          />
        </div>

        <div>
          <RichTextEditor
            key={`cancellation_policy-${currentLang}`}
            value={watch(getFieldName('cancellation_policy'))}
            onChange={(val) =>
              setValue(getFieldName('cancellation_policy'), val, { shouldValidate: true })
            }
            label={`Quy định hoàn hủy (${currentLang.toUpperCase()}) *`}
            placeholder="Chính sách hoàn hủy tour..."
            error={getFieldError('cancellation_policy')?.message}
          />
          <input
            type="hidden"
            {...register(
              getFieldName('cancellation_policy'),
              getRequiredRule('Vui lòng nhập chính sách hoàn hủy')
            )}
          />
        </div>
      </div>

      {/* Unified Image Management */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text block">
          Album ảnh tour{' '}
          {!modal.tour && files.length === 0 && (
            <span className="text-error font-normal">(Bắt buộc ít nhất 1 ảnh)</span>
          )}
        </label>

        <div
          className={`p-4 border-2 border-dashed rounded-2xl transition-all ${!modal.tour && files.length === 0 && Object.keys(errors).length > 0
              ? 'border-error bg-error/5'
              : 'border-border hover:border-primary/50 bg-surface-alt/50'
            }`}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('border-primary', 'bg-primary/5');
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
            const droppedFiles = Array.from(e.dataTransfer.files);
            if (droppedFiles.length > 0) setFiles((prev) => [...prev, ...droppedFiles]);
          }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {/* Existing Images */}
            {modal.tour?.images?.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square group rounded-lg overflow-hidden border border-border shadow-sm bg-surface"
              >
                <img
                  src={getImageUrl(img.image_url)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="w-8 h-8 bg-error text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                    title="Xóa ảnh hệ thống"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* New Uploaded Files */}
            {files.map((file, idx) => {
              const previewUrl = URL.createObjectURL(file);
              return (
                <div
                  key={idx}
                  className="relative aspect-square group rounded-lg overflow-hidden border border-border shadow-sm bg-surface"
                >
                  <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded-md shadow-sm z-10">
                    MỚI
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="w-8 h-8 bg-error text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                      title="Hủy ảnh này"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Upload Button Tile */}
            <label className="relative aspect-square flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-text-muted group">
              <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Thêm ảnh</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {files.length === 0 && (!modal.tour?.images || modal.tour.images.length === 0) && (
            <div className="text-center py-4 text-text-muted">
              <p className="text-xs font-medium">
                Kéo thả ảnh vào đây hoặc nhấp &quot;Thêm ảnh&quot;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══ ITEM CREATORS (DEFAULT 1 EMPTY ITEM) ═══
const createEmptyItinerary = (dayNumber = 1) => ({
  day_number: dayNumber,
  title: '',
  content: '',
  translations: [
    getEmptyItineraryTranslation('en'),
    getEmptyItineraryTranslation('zh'),
  ],
});

const createEmptyDeparture = () => ({
  departure_date: '',
  price_adult: '',
  price_child: 0,
  price_infant: 0,
  capacity: 20,
});

const createEmptyPickupLocation = () => ({
  location_name: '',
  pickup_time: '',
  surcharge_amount: 0,
});

const createEmptyOption = () => ({
  option_name: '',
  price: 0,
  charge_type: 'quantity',
});

// Helper: Tự động trôi mượt đến item mới và focus input đầu tiên để nhập liệu ngay
const scrollAndFocusNewItem = (cardSelector, inputSelector) => {
  setTimeout(() => {
    const cards = document.querySelectorAll(cardSelector);
    if (!cards || cards.length === 0) return;
    const lastCard = cards[cards.length - 1];

    // Trôi mượt đến giữa khung nhìn
    lastCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Focus input đầu tiên để user viết luôn
    setTimeout(() => {
      let targetInput = null;
      if (inputSelector) {
        targetInput = lastCard.querySelector(inputSelector);
      }
      if (!targetInput) {
        targetInput = lastCard.querySelector(
          'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([title]):not([disabled])'
        );
      }
      if (targetInput) {
        targetInput.focus({ preventScroll: true });
        if (typeof targetInput.select === 'function' && targetInput.type !== 'button') {
          targetInput.select();
        }
      }
    }, 150);
  }, 60);
};

// ═══ TAB: LỊCH TRÌNH ═══
const ItinerariesTab = ({ control, register, watch, setValue, errors, currentLang }) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'itineraries' });

  // Mặc định luôn có ít nhất 1 item trống
  useEffect(() => {
    if (fields.length === 0) {
      append(createEmptyItinerary(1));
    }
  }, [fields.length, append]);

  const getFieldName = (index, name) => {
    if (currentLang === 'vi') return `itineraries.${index}.${name}`;
    const itinerary = watch(`itineraries.${index}`);
    const safeLangIndex = getSafeTranslationLangIndex(currentLang, itinerary?.translations);
    return `itineraries.${index}.translations.${safeLangIndex}.${name}`;
  };

  const getFieldError = (index, name) => {
    if (currentLang === 'vi') return errors.itineraries?.[index]?.[name];
    const itinerary = watch(`itineraries.${index}`);
    const safeLangIndex = getSafeTranslationLangIndex(currentLang, itinerary?.translations);
    return errors.itineraries?.[index]?.translations?.[safeLangIndex]?.[name];
  };
  const getRequiredRule = (message) => (currentLang === 'vi' ? { required: message } : {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-text">
            Lịch trình từng ngày ({currentLang.toUpperCase()}) *
          </h4>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">
            {fields.length} ngày
          </span>
        </div>
      </div>

      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-surface-alt rounded-2xl border border-dashed border-border text-center">
          <List className="w-12 h-12 text-text-muted mb-3 opacity-50" />
          <p className="text-base font-semibold text-text mb-1">Chưa có lịch trình</p>
          <p className="text-sm text-error font-medium">
            Bắt buộc phải có ít nhất 1 ngày lịch trình cho tour.
          </p>
        </div>
      )}

      {fields.map((field, index) => {
        return (
          <div
            key={field.id}
            className="itinerary-day-card p-5 bg-surface-alt rounded-2xl border border-border space-y-4 shadow-sm relative group"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Ngày {index + 1}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (fields.length <= 1) {
                    setValue('itineraries.0', createEmptyItinerary(1), { shouldDirty: true });
                  } else {
                    remove(index);
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error text-text-muted transition"
                title={fields.length <= 1 ? 'Làm mới nội dung ngày' : 'Xóa ngày'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <input
              type="hidden"
              {...register(`itineraries.${index}.day_number`)}
              value={index + 1}
            />
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">
                Tiêu đề ngày ({currentLang.toUpperCase()}) *
              </label>
              <input
                key={`iti-title-${index}-${currentLang}`}
                type="text"
                {...register(getFieldName(index, 'title'), getRequiredRule('Nhập tiêu đề ngày'))}
                className={`w-full px-3 py-2 bg-surface border ${getFieldError(index, 'title') ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-lg text-sm focus:outline-none focus:ring-2 transition-all`}
                placeholder="VD: Đón khách - Tham quan phố cổ"
              />
              {getFieldError(index, 'title') && (
                <p className="text-error text-xs mt-1 font-medium">
                  {getFieldError(index, 'title').message}
                </p>
              )}
            </div>

            <div>
              <RichTextEditor
                key={`iti-content-${index}-${currentLang}`}
                value={watch(getFieldName(index, 'content'))}
                onChange={(val) =>
                  setValue(getFieldName(index, 'content'), val, { shouldValidate: true })
                }
                label={`Chi tiết hoạt động (${currentLang.toUpperCase()}) *`}
                placeholder="Mô tả chi tiết các hoạt động trong ngày..."
                error={getFieldError(index, 'content')?.message}
              />
              <input
                type="hidden"
                {...register(
                  getFieldName(index, 'content'),
                  getRequiredRule('Nhập nội dung hoạt động')
                )}
              />
            </div>
          </div>
        );
      })}

      {/* Nút thêm ngày ở ngay dưới item */}
      <button
        type="button"
        onClick={() => {
          append(createEmptyItinerary(fields.length + 1));
          scrollAndFocusNewItem(
            '.itinerary-day-card',
            'input[type="text"]:not([type="hidden"])'
          );
        }}
        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-primary/25 hover:border-primary bg-primary/[0.02] hover:bg-primary/[0.06] text-primary font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm hover:shadow active:scale-[0.995]"
      >
        <span className="w-6 h-6 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-all duration-200">
          <Plus className="w-4 h-4" />
        </span>
        <span>Thêm ngày tiếp theo (Ngày {fields.length + 1})</span>
      </button>
    </div>
  );
};

// ═══ TAB: LỊCH KHỞI HÀNH ═══
const DeparturesTab = ({ control, register, watch, setValue, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'departures',
    keyName: 'fieldId',
  });
  const todayDateOnly = getTodayDateOnly();

  // Mặc định luôn có ít nhất 1 item trống
  useEffect(() => {
    if (fields.length === 0) {
      append(createEmptyDeparture());
    }
  }, [fields.length, append]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-text">Lịch khởi hành & Giá *</h4>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">
            {fields.length} lịch
          </span>
        </div>
      </div>

      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-surface-alt rounded-2xl border border-dashed border-border text-center">
          <Calendar className="w-12 h-12 text-text-muted mb-3 opacity-50" />
          <p className="text-base font-semibold text-text mb-1">Chưa có lịch khởi hành</p>
          <p className="text-sm text-error font-medium">
            Bắt buộc phải cấu hình ít nhất 1 lịch khởi hành để hiển thị giá.
          </p>
        </div>
      )}

      {fields.map((field, index) => {
        const isDeparted = !!field.id && isDateBeforeToday(field.departure_date);

        return (
          <div
            key={field.fieldId}
            className="departure-item-card p-4 bg-surface-alt rounded-2xl border border-border space-y-4 shadow-sm relative"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                Khởi hành #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (isDeparted) return;
                  if (fields.length <= 1) {
                    setValue('departures.0', createEmptyDeparture(), { shouldDirty: true });
                  } else {
                    remove(index);
                  }
                }}
                disabled={isDeparted}
                className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error text-text-muted transition disabled:opacity-30 disabled:cursor-not-allowed"
                title={isDeparted ? 'Lịch đã khởi hành' : fields.length <= 1 ? 'Làm mới lịch' : 'Xóa'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {isDeparted && (
              <p className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Lịch này đã khởi hành nên không thể xóa.
              </p>
            )}
            <input type="hidden" {...register(`departures.${index}.id`)} />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">
                  Ngày đi *
                </label>
                <DepartureCalendar
                  value={watch(`departures.${index}.departure_date`)}
                  onChange={(value) =>
                    setValue(`departures.${index}.departure_date`, value, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    })
                  }
                  minDate={todayDateOnly}
                  selectableDatesOnly={false}
                  disabled={isDeparted}
                  placeholder="Chọn ngày đi"
                  className={`departure-calendar-box [&>button]:bg-surface ${errors.departures?.[index]?.departure_date ? '[&>button]:border-error [&>button]:focus:ring-error/30' : '[&>button]:border-border [&>button]:focus:ring-primary/30'}`}
                />
                <input
                  type="hidden"
                  {...register(`departures.${index}.departure_date`, {
                    required: 'Bắt buộc chọn',
                    validate: (value) =>
                      isDeparted || !isDateBeforeToday(value) || 'Ngày đi tối thiểu là hôm nay',
                  })}
                  className={`w-full px-3 py-2 bg-surface border ${errors.departures?.[index]?.departure_date ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-lg text-sm focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.departures?.[index]?.departure_date && (
                  <p className="text-error text-[10px] mt-1 font-medium">
                    {errors.departures[index].departure_date.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">
                  Giá NL (VNĐ) *
                </label>
                <PriceInput
                  control={control}
                  name={`departures.${index}.price_adult`}
                  rules={{ required: 'Bắt buộc', min: { value: 1, message: '>0' } }}
                  error={errors.departures?.[index]?.price_adult}
                  placeholder="3.500.000"
                />
                {errors.departures?.[index]?.price_adult && (
                  <p className="text-error text-[10px] mt-1 font-medium">
                    {errors.departures[index].price_adult.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">
                  Giá trẻ em (VNĐ) *
                </label>
                <PriceInput
                  control={control}
                  name={`departures.${index}.price_child`}
                  rules={{ required: 'Bắt buộc', min: { value: 0, message: '>=0' } }}
                  error={errors.departures?.[index]?.price_child}
                  placeholder="0"
                />
                {errors.departures?.[index]?.price_child && (
                  <p className="text-error text-[10px] mt-1 font-medium">
                    {errors.departures[index].price_child.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">
                  Giá em bé (VNĐ) *
                </label>
                <PriceInput
                  control={control}
                  name={`departures.${index}.price_infant`}
                  rules={{ required: 'Bắt buộc', min: { value: 0, message: '>=0' } }}
                  error={errors.departures?.[index]?.price_infant}
                  placeholder="0"
                />
                {errors.departures?.[index]?.price_infant && (
                  <p className="text-error text-[10px] mt-1 font-medium">
                    {errors.departures[index].price_infant.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">
                  Tổng sức chứa *
                </label>
                <input
                  type="number"
                  {...register(`departures.${index}.capacity`, {
                    required: 'Bắt buộc',
                    min: { value: 1, message: '>0' },
                  })}
                  className={`w-full px-3 py-2 bg-surface border ${errors.departures?.[index]?.capacity ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-lg text-sm focus:outline-none focus:ring-2 transition-all`}
                  placeholder="20"
                />
                {errors.departures?.[index]?.capacity && (
                  <p className="text-error text-[10px] mt-1 font-medium">
                    {errors.departures[index].capacity.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Nút thêm khởi hành ngay dưới item */}
      <button
        type="button"
        onClick={() => {
          append(createEmptyDeparture());
          scrollAndFocusNewItem(
            '.departure-item-card',
            '.departure-calendar-box button, input:not([type="hidden"])'
          );
        }}
        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-primary/25 hover:border-primary bg-primary/[0.02] hover:bg-primary/[0.06] text-primary font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm hover:shadow active:scale-[0.995]"
      >
        <span className="w-6 h-6 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-all duration-200">
          <Plus className="w-4 h-4" />
        </span>
        <span>Thêm lịch khởi hành mới</span>
      </button>
    </div>
  );
};

// ═══ TAB: ĐIỂM ĐÓN ═══
const PickupsTab = ({ control, register, setValue, errors }) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'pickup_locations' });

  // Mặc định luôn có ít nhất 1 item trống
  useEffect(() => {
    if (fields.length === 0) {
      append(createEmptyPickupLocation());
    }
  }, [fields.length, append]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-text">Điểm đón khách *</h4>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">
            {fields.length} điểm đón
          </span>
        </div>
      </div>

      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-surface-alt rounded-2xl border border-dashed border-border text-center">
          <Navigation className="w-12 h-12 text-text-muted mb-3 opacity-50" />
          <p className="text-base font-semibold text-text mb-1">Chưa có điểm đón</p>
          <p className="text-sm text-error font-medium">
            Bắt buộc cấu hình ít nhất 1 điểm đón để khách hàng lựa chọn.
          </p>
        </div>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="pickup-item-card p-4 bg-surface-alt rounded-2xl border border-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              Điểm đón #{index + 1}
            </span>
            <button
              type="button"
              onClick={() => {
                if (fields.length <= 1) {
                  setValue('pickup_locations.0', createEmptyPickupLocation(), { shouldDirty: true });
                } else {
                  remove(index);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error text-text-muted transition"
              title={fields.length <= 1 ? 'Làm mới điểm đón' : 'Xóa'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">
                Tên điểm đón *
              </label>
              <input
                type="text"
                {...register(`pickup_locations.${index}.location_name`, {
                  required: 'Nhập tên điểm đón',
                })}
                className={`w-full px-3 py-2 bg-surface border ${errors.pickup_locations?.[index]?.location_name ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-lg text-sm focus:outline-none focus:ring-2 transition-all`}
                placeholder="VD: Khách sạn Saigon"
              />
              {errors.pickup_locations?.[index]?.location_name && (
                <p className="text-error text-[10px] mt-1 font-medium">
                  {errors.pickup_locations[index].location_name.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">
                Giờ đón *
              </label>
              <TimeInput
                control={control}
                name={`pickup_locations.${index}.pickup_time`}
                rules={{ required: 'Nhập giờ đón' }}
                error={errors.pickup_locations?.[index]?.pickup_time}
              />
              {errors.pickup_locations?.[index]?.pickup_time && (
                <p className="text-error text-[10px] mt-1 font-medium">
                  {errors.pickup_locations[index].pickup_time.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">
                Phụ thu (VNĐ) *
              </label>
              <PriceInput
                control={control}
                name={`pickup_locations.${index}.surcharge_amount`}
                rules={{ required: 'Bắt buộc', min: { value: 0, message: '>= 0' } }}
                error={errors.pickup_locations?.[index]?.surcharge_amount}
                placeholder="0"
              />
              {errors.pickup_locations?.[index]?.surcharge_amount && (
                <p className="text-error text-[10px] mt-1 font-medium">
                  {errors.pickup_locations[index].surcharge_amount.message}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Nút thêm điểm đón ngay dưới item */}
      <button
        type="button"
        onClick={() => {
          append(createEmptyPickupLocation());
          scrollAndFocusNewItem(
            '.pickup-item-card',
            'input[type="text"]:not([type="hidden"])'
          );
        }}
        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-primary/25 hover:border-primary bg-primary/[0.02] hover:bg-primary/[0.06] text-primary font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm hover:shadow active:scale-[0.995]"
      >
        <span className="w-6 h-6 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-all duration-200">
          <Plus className="w-4 h-4" />
        </span>
        <span>Thêm điểm đón mới</span>
      </button>
    </div>
  );
};

// ═══ TAB: TÙY CHỌN ═══
const OptionsTab = ({ control, register, watch, setValue, errors }) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'options' });

  // Mặc định luôn có ít nhất 1 item trống
  useEffect(() => {
    if (fields.length === 0) {
      append(createEmptyOption());
    }
  }, [fields.length, append]);

  const chargeTypeOptions = [
    { label: 'Theo người', value: 'per_person' },
    { label: 'Theo đơn', value: 'per_booking' },
    { label: 'Số lượng', value: 'quantity' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-text">Tùy chọn nâng cao (Add-ons)</h4>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">
            {fields.length} tùy chọn
          </span>
        </div>
      </div>

      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-surface-alt rounded-2xl border border-dashed border-border text-center">
          <Settings className="w-12 h-12 text-text-muted mb-3 opacity-50" />
          <p className="text-base font-semibold text-text mb-1">Không có tùy chọn phụ</p>
          <p className="text-sm text-text-secondary">
            Bạn có thể cấu hình thêm các dịch vụ bán kèm như phòng đơn, buffet...
          </p>
        </div>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="option-item-card p-4 bg-surface-alt rounded-2xl border border-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              Tùy chọn #{index + 1}
            </span>
            <button
              type="button"
              onClick={() => {
                if (fields.length <= 1) {
                  setValue('options.0', createEmptyOption(), { shouldDirty: true });
                } else {
                  remove(index);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error text-text-muted transition"
              title={fields.length <= 1 ? 'Làm trống tùy chọn' : 'Xóa'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">
                Tên dịch vụ {watch && Number(watch(`options.${index}.price`)) > 0 ? '*' : ''}
              </label>
              <input
                type="text"
                {...register(`options.${index}.option_name`, {
                  validate: (value) => {
                    const opt = watch ? watch(`options.${index}`) : null;
                    const hasPrice = Number(opt?.price) > 0;
                    const hasName = String(value || '').trim().length > 0;
                    if (hasPrice && !hasName) {
                      return 'Vui lòng nhập tên dịch vụ tùy chọn khi đã nhập giá';
                    }
                    return true;
                  },
                })}
                className={`w-full px-3 py-2 bg-surface border ${errors.options?.[index]?.option_name ? 'border-error focus:ring-error/30' : 'border-border focus:ring-primary/30'} rounded-lg text-sm focus:outline-none focus:ring-2 transition-all`}
                placeholder="VD: Phụ thu phòng đơn (để trống nếu không dùng)"
              />
              {errors.options?.[index]?.option_name && (
                <p className="text-error text-[10px] mt-1 font-medium">
                  {errors.options[index].option_name.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">
                Giá (VNĐ)
              </label>
              <PriceInput
                control={control}
                name={`options.${index}.price`}
                rules={{
                  validate: (val) => {
                    const opt = watch ? watch(`options.${index}`) : null;
                    const hasName = String(opt?.option_name || '').trim().length > 0;
                    if (hasName && (val === '' || val === null || val === undefined)) {
                      return 'Bắt buộc';
                    }
                    return true;
                  },
                  min: { value: 0, message: '>=0' },
                }}
                error={errors.options?.[index]?.price}
                placeholder="0"
              />
              {errors.options?.[index]?.price && (
                <p className="text-error text-[10px] mt-1 font-medium">
                  {errors.options[index].price.message}
                </p>
              )}
            </div>
            <div className="[&>div>button]:py-2 [&>div>button]:bg-surface">
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block uppercase tracking-wider">
                Cách tính *
              </label>
              <Controller
                name={`options.${index}.charge_type`}
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={chargeTypeOptions}
                    placeholder="Chọn"
                  />
                )}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Nút thêm tùy chọn ngay dưới item */}
      <button
        type="button"
        onClick={() => {
          append(createEmptyOption());
          scrollAndFocusNewItem(
            '.option-item-card',
            'input[type="text"]:not([type="hidden"])'
          );
        }}
        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-primary/25 hover:border-primary bg-primary/[0.02] hover:bg-primary/[0.06] text-primary font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm hover:shadow active:scale-[0.995]"
      >
        <span className="w-6 h-6 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-all duration-200">
          <Plus className="w-4 h-4" />
        </span>
        <span>Thêm tùy chọn mới</span>
      </button>
    </div>
  );
};

const ITEMS_PER_PAGE = 100;
// ═══ MAIN PAGE ═══
const TourManagementPage = () => {
  const { t } = useTranslation();
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, tour: null });
  const [submitting, setSubmitting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translationCooldownUntil, setTranslationCooldownUntil] = useState(0);
  const [activeTab, setActiveTab] = useState('general');
  const [currentLang, setCurrentLang] = useState('vi'); // Language Switcher State
  const [files, setFiles] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const translatedSourceCacheRef = useRef(new Map());
  const sourceFieldBaselineRef = useRef(null);
  const translationBaselineRef = useRef([]);
  const initialViDataRef = useRef({});
  const cancelTranslationRef = useRef(false);

  const defaultValues = {
    category_id: '',
    title: '',
    summary: '',
    highlights: '',
    price_includes: '',
    price_excludes: '',
    terms_and_notes: '',
    cancellation_policy: '',
    duration_days: '',
    duration_nights: '',
    tour_badge: 'none',
    status: 'active',
    itineraries: [createEmptyItinerary(1)],
    departures: [createEmptyDeparture()],
    pickup_locations: [createEmptyPickupLocation()],
    options: [createEmptyOption()],
    translations: [getEmptyTourTranslation('en'), getEmptyTourTranslation('zh')],
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  const getTranslatedSourceCacheKey = (targetLang, fieldKey) =>
    `${normalizeAdminTranslationLanguage(targetLang)}:${fieldKey}`;

  const rememberTranslatedSources = (targetLang, translatedFields) => {
    Object.entries(translatedFields).forEach(([fieldKey, sourceValue]) => {
      translatedSourceCacheRef.current.set(
        getTranslatedSourceCacheKey(targetLang, fieldKey),
        normalizeTranslationSource(sourceValue)
      );
    });
  };

  const getTourSourceData = (tour) => {
    if (!tour) return {};

    const sourceData = {
      tour_title: tour.title,
      tour_summary: tour.summary,
      tour_highlights: tour.highlights,
      tour_price_includes: tour.price_includes,
      tour_price_excludes: tour.price_excludes,
      tour_terms_and_notes: tour.terms_and_notes,
      tour_cancellation_policy: tour.cancellation_policy,
    };

    (tour.itineraries || []).forEach((itinerary, index) => {
      sourceData[`iti_${index}_title`] = itinerary.title;
      sourceData[`iti_${index}_content`] = itinerary.content;
    });

    return sourceData;
  };

  const findStoredTranslation = (translations = [], targetLang) =>
    translations.find(
      (item) =>
        normalizeAdminTranslationLanguage(item?.language) ===
        normalizeAdminTranslationLanguage(targetLang)
    );

  const getStoredTargetTranslationValue = (tour, fieldKey, targetLang) => {
    if (fieldKey.startsWith('tour_')) {
      const field = fieldKey.replace(/^tour_/, '');
      return findStoredTranslation(tour.translations, targetLang)?.[field];
    }

    const itineraryMatch = fieldKey.match(/^iti_(\d+)_(.+)$/);
    if (!itineraryMatch) return '';

    const [, itineraryIndex, field] = itineraryMatch;
    const itinerary = tour.itineraries?.[Number(itineraryIndex)];
    return findStoredTranslation(itinerary?.translations, targetLang)?.[field];
  };

  const rememberStoredTranslatedSources = (tour) => {
    const sourceData = getTourSourceData(tour);

    ['en', 'zh'].forEach((targetLang) => {
      Object.entries(sourceData).forEach(([fieldKey, sourceValue]) => {
        const targetValue = getStoredTargetTranslationValue(tour, fieldKey, targetLang);
        if (!normalizeTranslationSource(targetValue)) return;

        translatedSourceCacheRef.current.set(
          getTranslatedSourceCacheKey(targetLang, fieldKey),
          normalizeTranslationSource(sourceValue)
        );
      });
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const tourParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      };
      const [toursRes, catsRes] = await Promise.all([
        adminService.getTours(tourParams),
        categoryService.getAll(),
      ]);
      setTours(toursRes.data.data || []);
      setTotalPages(toursRes.data.totalPages || 1);
      setTotalItems(toursRes.data.totalItems || 0);
      setCategories(catsRes.data.data || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  const handleSearchTours = () => {
    setCurrentPage(1);
    setDebouncedSearch(searchQuery.trim());
  };

  const clearSearchTours = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setDebouncedSearch('');
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const closeModal = () => {
    cancelTranslationRef.current = true;
    setTranslating(false);
    setModal({ open: false, tour: null });
  };

  const openCreate = () => {
    initialViDataRef.current = {};
    cancelTranslationRef.current = false;
    translatedSourceCacheRef.current.clear();
    reset({
      ...defaultValues,
      itineraries: [createEmptyItinerary(1)],
      departures: [createEmptyDeparture()],
      pickup_locations: [createEmptyPickupLocation()],
      options: [createEmptyOption()],
      translations: [getEmptyTourTranslation('en'), getEmptyTourTranslation('zh')],
    });
    setFiles([]);
    setActiveTab('general');
    setCurrentLang('vi');
    setModal({ open: true, tour: null });
  };

  const openEdit = async (tour) => {
    try {
      // Lấy chi tiết đầy đủ từ API
      const res = await adminService.getTourById(tour.id);
      const detail = res.data.data;
      translatedSourceCacheRef.current.clear();
      rememberStoredTranslatedSources(detail);
      initialViDataRef.current = getTourSourceData(detail);
      cancelTranslationRef.current = false;

      const rawItineraries = detail.itineraries || [];
      const rawDepartures = detail.departures || [];
      const rawPickups = detail.pickupLocations || [];
      const rawOptions = detail.options || [];

      reset({
        category_id: String(detail.category_id),
        title: detail.title,
        summary: detail.summary || '',
        highlights: detail.highlights || '',
        price_includes: detail.price_includes || '',
        price_excludes: detail.price_excludes || '',
        terms_and_notes: detail.terms_and_notes || '',
        cancellation_policy: detail.cancellation_policy || '',
        duration_days: detail.duration_days || '',
        duration_nights: detail.duration_nights || '',
        tour_badge: detail.tour_badge || 'none',
        status: detail.status || 'active',
        itineraries:
          rawItineraries.length > 0
            ? rawItineraries.map((it) => ({
                day_number: it.day_number,
                title: it.title,
                content: it.content,
                translations: mergeTranslationsByLanguage(
                  [getEmptyItineraryTranslation('en'), getEmptyItineraryTranslation('zh')],
                  it.translations
                ),
              }))
            : [createEmptyItinerary(1)],
        departures:
          rawDepartures.length > 0
            ? rawDepartures.map((d) => ({
                id: d.id,
                departure_date: normalizeDateOnly(d.departure_date),
                price_adult: normalizeMoneyValue(d.price_adult),
                price_child: normalizeMoneyValue(d.price_child),
                price_infant: normalizeMoneyValue(d.price_infant),
                capacity: normalizeIntegerValue(d.capacity ?? d.available_seats),
              }))
            : [createEmptyDeparture()],
        pickup_locations:
          rawPickups.length > 0
            ? rawPickups.map((p) => ({
                location_name: p.location_name,
                pickup_time: normalizeTimeValue(p.pickup_time),
                surcharge_amount: normalizeMoneyValue(p.surcharge_amount),
              }))
            : [createEmptyPickupLocation()],
        options:
          rawOptions.length > 0
            ? rawOptions.map((o) => ({
                option_name: o.option_name,
                price: normalizeMoneyValue(o.price),
                charge_type: o.charge_type || 'quantity',
              }))
            : [createEmptyOption()],
        translations: mergeTranslationsByLanguage(
          [getEmptyTourTranslation('en'), getEmptyTourTranslation('zh')],
          detail.translations
        ),
      });
      sourceFieldBaselineRef.current = Object.fromEntries(
        ROOT_CONTENT_FIELDS.map((field) => [field, detail[field] ?? ''])
      );
      translationBaselineRef.current = mergeTranslationsByLanguage(
        [getEmptyTourTranslation('en'), getEmptyTourTranslation('zh')],
        detail.translations
      );

      setFiles([]);
      setActiveTab('general');
      setCurrentLang('vi');
      setModal({ open: true, tour: detail });
    } catch (err) {
      toast.error('Lỗi tải chi tiết tour');
    }
  };

  const onSubmit = async (data) => {
    if (translating) {
      toast.warning('Hệ thống đang dịch, vui lòng đợi quá trình dịch hoàn tất trước khi lưu.');
      return;
    }

    const missingVietnameseContent = findMissingVietnameseContent(data);
    if (missingVietnameseContent) {
      setCurrentLang('vi');
      setActiveTab(missingVietnameseContent.tab);
      setError(missingVietnameseContent.path, {
        type: 'required',
        message: missingVietnameseContent.message,
      });
      toast.error(missingVietnameseContent.message);
      return;
    }

    // Tab routing for arrays if error/empty
    if (data.itineraries.length === 0) {
      setActiveTab('itineraries');
      toast.error('Bắt buộc phải có ít nhất 1 ngày lịch trình');
      return;
    }
    if (data.departures.length === 0) {
      setActiveTab('departures');
      toast.error('Bắt buộc phải có ít nhất 1 lịch khởi hành');
      return;
    }
    const originalDeparturesById = new Map(
      (modal.tour?.departures || []).map((item) => [Number(item.id), item])
    );
    const invalidDepartureIndex = data.departures.findIndex((departure) => {
      const original = departure.id ? originalDeparturesById.get(Number(departure.id)) : null;
      const originalDeparted = original && isDateBeforeToday(original.departure_date);

      if (originalDeparted) {
        return (
          normalizeDateOnly(departure.departure_date) !== normalizeDateOnly(original.departure_date)
        );
      }

      return isDateBeforeToday(departure.departure_date);
    });
    if (invalidDepartureIndex !== -1) {
      setActiveTab('departures');
      toast.error(`Ngày đi của khởi hành #${invalidDepartureIndex + 1} tối thiểu là hôm nay`);
      return;
    }

    if (data.pickup_locations.length === 0) {
      setActiveTab('pickups');
      toast.error('Bắt buộc phải cấu hình ít nhất 1 điểm đón');
      return;
    }
    const invalidPickupTimeIndex = data.pickup_locations.findIndex(
      (pickup) => !normalizeTimeValue(pickup.pickup_time)
    );
    if (invalidPickupTimeIndex !== -1) {
      setActiveTab('pickups');
      toast.error(`Giờ đón của điểm đón #${invalidPickupTimeIndex + 1} không hợp lệ`);
      return;
    }

    if (!modal.tour && files.length === 0) {
      setActiveTab('general');
      toast.error('Vui lòng tải lên ít nhất 1 ảnh đại diện cho tour');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      const normalizedDepartures = normalizeTourDeparturesPayload(data.departures || []);
      const normalizedPickupLocations = normalizePickupLocationsPayload(
        data.pickup_locations || []
      );
      const normalizedOptions = normalizeTourOptionsPayload(data.options || []);

      // Thông tin chung
      const generalFields = [
        'category_id',
        'duration_days',
        'duration_nights',
        'tour_badge',
        'status',
      ];
      generalFields.forEach((key) => {
        if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
          fd.append(key, data[key]);
        }
      });
      Object.entries(getTourSourcePayload(data, {
        isCreate: !modal.tour,
        baseline: sourceFieldBaselineRef.current || {},
      })).forEach(([key, value]) => fd.append(key, value));

      // Satellite data → JSON strings
      fd.append('itineraries', JSON.stringify(data.itineraries || []));
      fd.append('departures', JSON.stringify(normalizedDepartures));
      fd.append('pickup_locations', JSON.stringify(normalizedPickupLocations));
      fd.append('options', JSON.stringify(normalizedOptions));

      const preparedTranslations = (data.translations || []).map((tr) => {
        const hasContent = [
          'title',
          'summary',
          'highlights',
          'price_includes',
          'price_excludes',
          'terms_and_notes',
          'cancellation_policy',
        ].some((f) => isMeaningfulText(tr?.[f]));
        if (hasContent && !tr?.title?.trim()) {
          return { ...tr, title: data.title || '' };
        }
        return tr;
      });

      fd.append('translations', JSON.stringify(getTourTranslationPayload(
        preparedTranslations,
        {
          isCreate: !modal.tour,
          baseline: translationBaselineRef.current,
        }
      )));

      // Images
      files.forEach((f) => fd.append('images', f));

      if (modal.tour) {
        await adminService.updateTour(modal.tour.id, fd);
        toast.success('Cập nhật tour thành công!');
      } else {
        await adminService.createTour(fd);
        toast.success('Thêm tour mới thành công!');
      }
      setFiles([]);
      setModal({ open: false, tour: null });
      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const applyTranslatedContent = (translated, targetLang) => {
    const normalizedTarget = normalizeAdminTranslationLanguage(targetLang);
    if (!normalizedTarget || normalizedTarget === 'vi') return;

    const translations = watch('translations') || [];
    const langIndex = getSafeTranslationLangIndex(normalizedTarget, translations);

    const setTranslatedValue = (fieldName, value) => {
      setValue(fieldName, value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    };

    setTranslatedValue(`translations.${langIndex}.language`, normalizedTarget);

    Object.keys(translated).forEach((key) => {
      if (key.startsWith('tour_')) {
        const field = key.replace(/^tour_/, '');
        setTranslatedValue(`translations.${langIndex}.${field}`, translated[key]);
        return;
      }

      const parts = key.split('_');
      if (parts.length === 3) {
        const index = parts[1];
        const field = parts[2];
        const itinerary = watch(`itineraries.${index}`);
        const itineraryLangIndex = getSafeTranslationLangIndex(normalizedTarget, itinerary?.translations);

        setTranslatedValue(
          `itineraries.${index}.translations.${itineraryLangIndex}.language`,
          normalizedTarget
        );
        setTranslatedValue(
          `itineraries.${index}.translations.${itineraryLangIndex}.${field}`,
          translated[key]
        );
      }
    });
  };

  const getVietnameseContentForTranslation = () => {
    const viData = {
      tour_title: watch('title'),
      tour_summary: watch('summary'),
      tour_highlights: watch('highlights'),
      tour_price_includes: watch('price_includes'),
      tour_price_excludes: watch('price_excludes'),
      tour_terms_and_notes: watch('terms_and_notes'),
      tour_cancellation_policy: watch('cancellation_policy'),
    };

    const itineraries = watch('itineraries') || [];
    itineraries.forEach((iti, index) => {
      viData[`iti_${index}_title`] = iti.title;
      viData[`iti_${index}_content`] = iti.content;
    });

    return viData;
  };

  const normalizeTranslationSource = (value) => String(value || '').trim();

  const getTargetTranslationValue = (key, targetLang) => {
    const normalizedTarget = normalizeAdminTranslationLanguage(targetLang);
    if (!normalizedTarget || normalizedTarget === 'vi') return '';

    const translations = watch('translations') || [];
    const langIndex = getSafeTranslationLangIndex(normalizedTarget, translations);

    if (key.startsWith('tour_')) {
      const field = key.replace(/^tour_/, '');
      return watch(`translations.${langIndex}.${field}`);
    }

    const parts = key.split('_');
    if (parts.length === 3) {
      const index = parts[1];
      const field = parts[2];
      const itinerary = watch(`itineraries.${index}`);
      const itineraryLangIndex = getSafeTranslationLangIndex(normalizedTarget, itinerary?.translations);
      return watch(`itineraries.${index}.translations.${itineraryLangIndex}.${field}`);
    }

    return '';
  };

  const getTranslatableFields = (viData, targetLang) => {
    return Object.fromEntries(
      Object.entries(viData).filter(([key, value]) => {
        if (!isMeaningfulText(value)) return false;

        const hasTarget = isMeaningfulText(getTargetTranslationValue(key, targetLang));
        const currentSource = normalizeTranslationSource(value);
        const initialSource = normalizeTranslationSource(initialViDataRef.current?.[key]);

        // Nếu trường này đã có bản dịch và nguồn tiếng Việt KHÔNG thay đổi -> Bỏ qua, không dịch lại
        if (hasTarget && initialSource && initialSource === currentSource) {
          return false;
        }

        // Dịch khi:
        // 1. Nguồn tiếng Việt bị thay đổi (currentSource !== initialSource)
        // 2. Hoặc trường đó chưa hề có bản dịch (!hasTarget)
        return true;
      })
    );
  };

  const handleTranslate = async () => {
    if (translating) return;

    const cooldownRemainingMs = translationCooldownUntil - Date.now();
    if (cooldownRemainingMs > 0) {
      const cooldownRemainingSeconds = Math.ceil(cooldownRemainingMs / 1000);
      toast.warning(
        `Dịch vụ dịch đang bị giới hạn. Vui lòng thử lại sau ${cooldownRemainingSeconds} giây.`
      );
      return;
    }

    const missingVietnameseContent = findMissingVietnameseContent(watch());
    if (missingVietnameseContent) {
      setCurrentLang('vi');
      setActiveTab(missingVietnameseContent.tab);
      setError(missingVietnameseContent.path, {
        type: 'required',
        message: missingVietnameseContent.message,
      });
      toast.error(missingVietnameseContent.message);
      return;
    }

    const viData = getVietnameseContentForTranslation();

    if (Object.values(viData).every((v) => !normalizeTranslationSource(v))) {
      toast.warning('Chưa có nội dung Tiếng Việt để dịch');
      return;
    }

    const targetLanguages = currentLang === 'vi' ? ['en', 'zh'] : [currentLang];
    const translationPayloadByLanguage = targetLanguages.reduce((payloads, targetLang) => {
      const fields = getTranslatableFields(viData, targetLang);
      if (Object.keys(fields).length > 0) {
        payloads[targetLang] = fields;
      }
      return payloads;
    }, {});
    const languagesToTranslate = targetLanguages.filter(
      (targetLang) => translationPayloadByLanguage[targetLang]
    );

    if (languagesToTranslate.length === 0) {
      toast.info('Không có nội dung mới hoặc thay đổi cần dịch');
      return;
    }

    let toastId;
    let activeTargetLang = languagesToTranslate[0];
    cancelTranslationRef.current = false;

    try {
      setTranslating(true);
      const totalFieldsToTranslate = languagesToTranslate.reduce(
        (total, targetLang) => total + Object.keys(translationPayloadByLanguage[targetLang]).length,
        0
      );

      toastId = toast.loading(
        `Đang dịch ${totalFieldsToTranslate} nội dung thay đổi sang ${
          languagesToTranslate.length === 2
            ? 'English và Tiếng Trung'
            : getTranslationDisplayName(activeTargetLang)
        }...`
      );

      for (const targetLang of languagesToTranslate) {
        if (cancelTranslationRef.current) break;
        activeTargetLang = targetLang;
        const fieldsToTranslate = translationPayloadByLanguage[targetLang];

        // Gửi toàn bộ các trường cần dịch trong 1 request batch
        const res = await adminService.translateContent({
          texts: fieldsToTranslate,
          targetLang,
          strict: true,
        });

        if (cancelTranslationRef.current) break;

        if (res?.data?.data) {
          applyTranslatedContent(res.data.data, targetLang);
          rememberTranslatedSources(targetLang, fieldsToTranslate);
          // Cập nhật lại snapshot cho các trường vừa dịch thành công
          Object.entries(fieldsToTranslate).forEach(([k, v]) => {
            if (initialViDataRef.current) {
              initialViDataRef.current[k] = normalizeTranslationSource(v);
            }
          });
        }
      }

      if (!cancelTranslationRef.current) {
        toast.success('Dịch tự động thành công!', { id: toastId });
      }
    } catch (error) {
      if (cancelTranslationRef.current) return;
      const fallbackMessage = isTranslationTimeout(error)
        ? `Quá trình dịch đang mất nhiều thời gian. Vui lòng thử lại sau.`
        : getTranslationServerMessage(error) ||
          `Lỗi khi dịch nội dung. Bạn vẫn có thể lưu tour bình thường.`;
      if (isTranslationRateLimited(error)) {
        setTranslationCooldownUntil(Date.now() + TRANSLATION_RATE_LIMIT_COOLDOWN_MS);
      }
      toast.error(fallbackMessage, toastId ? { id: toastId } : undefined);
    } finally {
      setTranslating(false);
    }
  };

  const performDelete = async (id) => {
    try {
      await adminService.deleteTour(id);
      toast.success('Xóa tour thành công!');
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi xóa tour');
    }
  };

  const handleDelete = (id) => {
    toast('Xác nhận xóa', {
      description: 'Bạn có chắc chắn muốn xóa tour này?',
      action: {
        label: 'Xóa',
        onClick: () => performDelete(id),
      },
      cancel: {
        label: 'Hủy',
      },
      duration: 5000,
    });
  };

  const performDeleteImage = async (imageId) => {
    try {
      await adminService.deleteTourImage(imageId);
      toast.success('Xóa ảnh thành công!');
      // Update local state for modal
      if (modal.tour) {
        setModal((prev) => ({
          ...prev,
          tour: {
            ...prev.tour,
            images: prev.tour.images.filter((img) => img.id !== imageId),
          },
        }));
      }
      await fetchData();
    } catch {
      toast.error('Lỗi xóa ảnh');
    }
  };

  const handleDeleteImage = (imageId) => {
    toast('Xác nhận xóa ảnh', {
      description: 'Bạn có chắc chắn muốn xóa ảnh này?',
      action: {
        label: 'Xóa',
        onClick: () => performDeleteImage(imageId),
      },
      cancel: {
        label: 'Hủy',
      },
      duration: 5000,
    });
  };

  // Check if a specific tab has validation errors
  const checkTabHasError = (tabKey) => {
    return Object.keys(errors).some((key) => {
      if (
        tabKey === 'general' &&
        [
          'category_id',
          'title',
          'summary',
          'duration_days',
          'duration_nights',
          'highlights',
          'price_includes',
          'price_excludes',
          'terms_and_notes',
          'cancellation_policy',
        ].includes(key)
      )
        return true;
      if (tabKey === 'itineraries' && key === 'itineraries') return true;
      if (tabKey === 'departures' && key === 'departures') return true;
      if (tabKey === 'pickups' && key === 'pickup_locations') return true;
      if (tabKey === 'options' && key === 'options') return true;
      return false;
    });
  };

  // Intercept form submission to switch to first tab with errors
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(
      (data) => {
        onSubmit(data);
      },
      (formErrors) => {
        // Find the first tab that has an error
        for (const tab of TABS) {
          if (
            Object.keys(formErrors).some((key) => {
              if (
                tab.key === 'general' &&
                [
                  'category_id',
                  'title',
                  'summary',
                  'duration_days',
                  'duration_nights',
                  'highlights',
                  'price_includes',
                  'price_excludes',
                  'terms_and_notes',
                  'cancellation_policy',
                ].includes(key)
              )
                return true;
              if (tab.key === 'itineraries' && key === 'itineraries') return true;
              if (tab.key === 'departures' && key === 'departures') return true;
              if (tab.key === 'pickups' && key === 'pickup_locations') return true;
              if (tab.key === 'options' && key === 'options') return true;
              return false;
            })
          ) {
            setActiveTab(tab.key);
            toast.error('Vui lòng kiểm tra lại thông tin bị lỗi trên tab này');
            break;
          }
        }
      }
    )(e);
  };

  return (
    <AdminLayout>
      <div className="flex h-[calc(100dvh-6rem)] flex-col gap-6 overflow-hidden sm:h-[calc(100dvh-5.5rem)]">
        {/* Header */}
        <div className="flex shrink-0 flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <div className="w-full max-w-2xl">
              <SearchBar
                variant="admin"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onSearch={handleSearchTours}
                onClear={clearSearchTours}
                placeholder={t('admin.tours.searchPlaceholder', 'Search tours...')}
                showButton
              />
              <p className="mt-1.5 text-[11px] font-medium text-text-muted">
                {t('admin.tours.total', '{{count}} tours', { count: totalItems })}
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="min-h-[46px] px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 text-sm shadow-md shrink-0 lg:self-start"
          >
            <Plus className="w-4 h-4" /> {t('admin.tours.add', 'Add tour')}
          </button>
        </div>

        {/* Table */}
        <TourManagementTable
          tours={tours}
          loading={loading}
          onEdit={openEdit}
          onDelete={handleDelete}
          page={currentPage}
          pageSize={ITEMS_PER_PAGE}
        />

        {/* Pagination Logic */}
        {totalPages > 1 && (
          <div className="flex shrink-0 flex-col items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={loading || currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-3 text-sm font-medium rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  disabled={loading || page === currentPage}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold border transition ${page === currentPage
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                      : 'bg-surface border-border text-text-secondary hover:bg-surface-hover'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={loading || currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-3 text-sm font-medium rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ MULTI-TAB MODAL FORM ═══ */}
      {modal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-surface rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] lg:h-[85vh] flex flex-col animate-fade-up ring-1 ring-white/10">
            {/* Header */}
            <div className="sticky top-0 bg-surface z-10 px-6 py-4 border-b border-border flex items-center justify-between shrink-0 rounded-t-2xl">
              <h3 className="text-xl font-extrabold text-text tracking-tight">
                {modal.tour ? 'Sửa Tour' : 'Thêm Tour Mới'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-surface-hover transition text-text-secondary hover:text-error hover:bg-error/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 pt-4 border-b border-border flex gap-2 overflow-x-auto shrink-0 scrollbar-hide [&::-webkit-scrollbar]:hidden">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isError = checkTabHasError(tab.key);

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl transition-all duration-200 whitespace-nowrap relative ${activeTab === tab.key
                        ? 'bg-primary/10 text-primary border-b-2 border-primary -mb-px'
                        : 'text-text-muted hover:text-text hover:bg-surface-alt'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${activeTab === tab.key ? 'text-primary' : ''}`} />
                    {tab.label}
                    {isError && (
                      <span
                        className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse shadow-sm"
                        title="Có lỗi nhập liệu"
                      ></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Language Switcher & AI Translation */}
            {['general', 'itineraries'].includes(activeTab) && (
              <TranslationToolbar
                currentLang={currentLang}
                translating={translating}
                onLanguageChange={setCurrentLang}
                onTranslate={handleTranslate}
              />
            )}

            {/* Tab Content */}
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col flex-1 overflow-hidden relative"
            >
              <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-surface-alt/30">
                <div
                  key={activeTab}
                  className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500 ease-out fill-mode-both"
                >
                  {activeTab === 'general' && (
                    <GeneralTab
                      key={`general-${currentLang}`}
                      register={register}
                      watch={watch}
                      setValue={setValue}
                      categories={categories}
                      modal={modal}
                      files={files}
                      setFiles={setFiles}
                      handleDeleteImage={handleDeleteImage}
                      errors={errors}
                      control={control}
                      currentLang={currentLang}
                    />
                  )}
                  {activeTab === 'itineraries' && (
                    <ItinerariesTab
                      key={`itineraries-${currentLang}`}
                      control={control}
                      register={register}
                      watch={watch}
                      setValue={setValue}
                      errors={errors}
                      currentLang={currentLang}
                    />
                  )}
                  {activeTab === 'departures' && (
                    <DeparturesTab
                      control={control}
                      register={register}
                      watch={watch}
                      setValue={setValue}
                      errors={errors}
                    />
                  )}
                  {activeTab === 'pickups' && (
                    <PickupsTab
                      control={control}
                      register={register}
                      setValue={setValue}
                      errors={errors}
                    />
                  )}
                  {activeTab === 'options' && (
                    <OptionsTab
                      control={control}
                      register={register}
                      watch={watch}
                      setValue={setValue}
                      errors={errors}
                    />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 shrink-0 bg-surface rounded-b-2xl">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-surface-alt text-text-secondary font-bold rounded-lg hover:bg-surface-hover transition text-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting || translating}
                  className="px-8 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-lg hover:opacity-90 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : translating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang dịch...
                    </>
                  ) : modal.tour ? (
                    'Lưu thay đổi'
                  ) : (
                    'Thêm Tour Mới'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default TourManagementPage;
