import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { adminService } from '@/services/tourService';
import { getImageUrl } from '@/utils/imageUrl';
import {
  ChevronDown,
  ListPlus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Frame,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// ═══ BULLET SYMBOLS LIBRARY ═══
export const BULLET_LIBRARY = [
  { label: 'None', symbol: '', title: 'Bỏ bullet', i18nKey: 'admin.editor.bulletNone' },
  { label: '–', symbol: '– ', title: 'Dấu gạch ngang', i18nKey: 'admin.editor.bulletDash' },
  { label: '•', symbol: '• ', title: 'Dấu chấm tròn', i18nKey: 'admin.editor.bulletDot' },
  { label: '○', symbol: '○ ', title: 'Dấu tròn rỗng', i18nKey: 'admin.editor.bulletCircle' },
  { label: '■', symbol: '■ ', title: 'Dấu hình vuông', i18nKey: 'admin.editor.bulletSquare' },
  { label: '❖', symbol: '❖ ', title: 'Dấu kim cương', i18nKey: 'admin.editor.bulletDiamond' },
  { label: '➢', symbol: '➢ ', title: 'Dấu mũi tên', i18nKey: 'admin.editor.bulletArrow' },
  { label: '✓', symbol: '✓ ', title: 'Dấu tích', i18nKey: 'admin.editor.bulletCheck' },
];

/**
 * RichTextEditor - Component soạn thảo văn bản chuẩn Word với tính năng:
 * - Toolbar ghim cố định (Sticky Header) khi cuộn nội dung dài.
 * - Thư viện ký hiệu đầu dòng (Bullet Library).
 * - Bố cục hình ảnh (Design image kiểu Word): Trôi chữ, kích thước, viền khung nghệ thuật.
 * - Responsive 100% trên thiết bị Mobile, Tablet và Desktop.
 */
const RichTextEditor = ({
  value,
  onChange,
  label,
  placeholder,
  error,
  className = '',
  minHeight = '160px',
}) => {
  const { t } = useTranslation();
  const [ReactQuill, setReactQuill] = useState(null);
  const quillRef = useRef(null);
  const containerRef = useRef(null);

  // Trạng thái định dạng ảnh
  const [selectedImg, setSelectedImg] = useState(null);
  const [imgAlign, setImgAlign] = useState('inline');
  const [imgSize, setImgSize] = useState('100%');
  const [hasFrame, setHasFrame] = useState(false);

  // Trạng thái mở menu phụ Word-style
  const [showBulletLibrary, setShowBulletLibrary] = useState(false);
  const [showImageDesign, setShowImageDesign] = useState(false);
  const [toolbarHeight, setToolbarHeight] = useState(42);

  // Theo dõi chiều cao thực tế của toolbar để tự co giãn vị trí dropdown trên mọi màn hình (mobile/tablet/desktop)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateHeight = () => {
      const tb = container.querySelector('.ql-toolbar');
      if (tb) {
        setToolbarHeight(tb.offsetHeight);
      }
    };

    updateHeight();
    const interval = setInterval(updateHeight, 300);
    return () => clearInterval(interval);
  }, [ReactQuill]);

  const getSafeEditor = useCallback(() => {
    try {
      return quillRef.current?.getEditor?.() || null;
    } catch {
      return null;
    }
  }, []);

  // Đăng ký custom image blot an toàn cho Quill
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
              format(name, attrValue) {
                if (ATTRIBUTES.includes(name)) {
                  if (attrValue) {
                    this.domNode.setAttribute(name, attrValue);
                  } else {
                    this.domNode.removeAttribute(name);
                  }
                } else {
                  super.format(name, attrValue);
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

  // Cập nhật trạng thái hiển thị của ảnh đang chọn
  const updateActiveImageState = useCallback((img) => {
    if (!img) return;
    const style = img.style || {};

    if (style.float === 'right') setImgAlign('right');
    else if (style.float === 'left') setImgAlign('left');
    else if (style.display === 'block' && style.margin?.includes('auto')) setImgAlign('center');
    else setImgAlign('inline');

    const maxW = style.maxWidth || '';
    if (['25%', '40%', '60%', '100%'].includes(maxW)) setImgSize(maxW);
    else if (!maxW) setImgSize('100%');
    else setImgSize('custom');

    const hasShadow = !!(style.boxShadow && style.boxShadow.includes('rgba'));
    setHasFrame(hasShadow);
  }, []);

  const triggerChange = useCallback(
    (targetImg) => {
      const editor = getSafeEditor();
      if (!editor) return;
      if (targetImg) targetImg.classList.remove('ql-selected-image');
      const html = editor.root.innerHTML;
      if (targetImg) targetImg.classList.add('ql-selected-image');
      onChange(html);
    },
    [onChange, getSafeEditor]
  );

  const handleSelectImage = useCallback(
    (imgNode) => {
      if (!imgNode) return;
      setSelectedImg(imgNode);
      updateActiveImageState(imgNode);
    },
    [updateActiveImageState]
  );

  // Tìm ảnh đang chọn hoặc tự động chọn ảnh đầu tiên trong bài viết
  const getOrFindImage = useCallback(() => {
    if (selectedImg && selectedImg.isConnected) return selectedImg;
    const img = containerRef.current?.querySelector('.ql-editor img');
    if (img) {
      handleSelectImage(img);
      return img;
    }
    toast.info(t('admin.editor.selectImagePrompt', 'Vui lòng chọn hoặc chèn một hình ảnh vào bài viết để áp dụng'));
    return null;
  }, [selectedImg, handleSelectImage, t]);

  // Căn lề / Bố cục chữ kiểu Word
  const applyAlignment = (align) => {
    const targetImg = getOrFindImage();
    if (!targetImg) return;

    if (align === 'right') {
      targetImg.style.float = 'right';
      targetImg.style.display = 'inline-block';
      targetImg.style.margin = '4px 0 14px 18px';
      targetImg.style.clear = 'none';
      if (!targetImg.style.maxWidth || targetImg.style.maxWidth === '100%') {
        targetImg.style.maxWidth = '40%';
      }
    } else if (align === 'left') {
      targetImg.style.float = 'left';
      targetImg.style.display = 'inline-block';
      targetImg.style.margin = '4px 18px 14px 0';
      targetImg.style.clear = 'none';
      if (!targetImg.style.maxWidth || targetImg.style.maxWidth === '100%') {
        targetImg.style.maxWidth = '40%';
      }
    } else if (align === 'center') {
      targetImg.style.float = 'none';
      targetImg.style.display = 'block';
      targetImg.style.margin = '14px auto';
      targetImg.style.clear = 'both';
      if (!targetImg.style.maxWidth || targetImg.style.maxWidth === '40%') {
        targetImg.style.maxWidth = '75%';
      }
    } else {
      targetImg.style.float = 'none';
      targetImg.style.display = 'inline-block';
      targetImg.style.margin = '6px 0';
      targetImg.style.clear = 'none';
    }

    targetImg.setAttribute('style', targetImg.style.cssText);
    updateActiveImageState(targetImg);
    triggerChange(targetImg);
  };

  // Áp dụng kích thước tỷ lệ ảnh
  const applySize = (size) => {
    const targetImg = getOrFindImage();
    if (!targetImg) return;
    targetImg.style.maxWidth = size;
    targetImg.style.width = 'auto';
    targetImg.setAttribute('style', targetImg.style.cssText);
    updateActiveImageState(targetImg);
    triggerChange(targetImg);
  };

  // Bật / tắt khung ảnh viền nghệ thuật
  const toggleFrame = () => {
    const targetImg = getOrFindImage();
    if (!targetImg) return;
    if (hasFrame) {
      targetImg.style.border = '';
      targetImg.style.boxShadow = '';
      targetImg.style.borderRadius = '6px';
    } else {
      targetImg.style.border = '4px solid #ffffff';
      targetImg.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
      targetImg.style.borderRadius = '4px';
    }
    targetImg.setAttribute('style', targetImg.style.cssText);
    updateActiveImageState(targetImg);
    triggerChange(targetImg);
  };

  // Xóa ảnh
  const deleteSelectedImage = () => {
    const targetImg = getOrFindImage();
    if (!targetImg) return;
    const editor = getSafeEditor();
    targetImg.classList.remove('ql-selected-image');
    targetImg.remove();
    setSelectedImg(null);
    if (editor) {
      onChange(editor.root.innerHTML);
    }
  };

  // Xử lý upload ảnh an toàn
  const uploadAndInsertImage = useCallback(
    async (file) => {
      const formData = new FormData();
      formData.append('image', file);

      const editor = getSafeEditor();
      const range = editor?.getSelection?.(true) || { index: editor?.getLength?.() || 0, length: 0 };

      try {
        const res = await adminService.uploadGuideImage(formData);
        const imageUrl = getImageUrl(res.data?.data?.image_url);
        if (editor && imageUrl) {
          editor.insertEmbed(range.index, 'image', imageUrl, 'user');
          editor.setSelection(range.index + 1);
          toast.success(t('admin.editor.uploadSuccess', 'Đã tải ảnh lên thành công'));
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
    },
    [getSafeEditor, t]
  );

  // Chèn ký hiệu Bullet Library
  const insertBulletSymbol = useCallback(
    (symbol) => {
      const editor = getSafeEditor();
      if (!editor) return;

      const range = editor.getSelection?.(true) || { index: 0, length: 0 };
      if (symbol === '') {
        const [line] = editor.getLine?.(range.index) || [];
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
    },
    [getSafeEditor]
  );

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

  const toggleBulletLibrary = useCallback(() => {
    setShowBulletLibrary((prev) => {
      const next = !prev;
      if (next) setShowImageDesign(false);
      return next;
    });
  }, []);

  const toggleImageDesign = useCallback(() => {
    setShowImageDesign((prev) => {
      const next = !prev;
      if (next) {
        setShowBulletLibrary(false);
        if (!selectedImg) {
          const firstImg = containerRef.current?.querySelector('.ql-editor img');
          if (firstImg) {
            handleSelectImage(firstImg);
          }
        }
      }
      return next;
    });
  }, [selectedImg, handleSelectImage]);

  // Lắng nghe sự kiện click chọn ảnh và paste ảnh an toàn
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeClick = (e) => {
      const target = e.target;
      const img = target?.tagName === 'IMG' ? target : target?.closest?.('img');
      if (img) {
        e.stopPropagation();
        handleSelectImage(img);
        setShowImageDesign(true);
        setShowBulletLibrary(false);
      } else if (
        !target?.closest?.('.ql-toolbar') &&
        !target?.closest?.('.image-toolbar') &&
        !target?.closest?.('.custom-toolbar-panel') &&
        !target?.closest?.('.custom-tool-btn') &&
        !target?.closest?.('.bullet-library-bar')
      ) {
        setSelectedImg(null);
      }
    };

    const handleNativeMouseDown = (e) => {
      const target = e.target;
      const img = target?.tagName === 'IMG' ? target : target?.closest?.('img');
      if (img) {
        handleSelectImage(img);
        setShowImageDesign(true);
        setShowBulletLibrary(false);
      }
    };

    const handleNativePaste = (e) => {
      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      if (!items || items.length === 0) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            uploadAndInsertImage(file);
            return;
          }
        }
      }
    };

    container.addEventListener('click', handleNativeClick, true);
    container.addEventListener('mousedown', handleNativeMouseDown, true);
    container.addEventListener('paste', handleNativePaste, true);

    return () => {
      container.removeEventListener('click', handleNativeClick, true);
      container.removeEventListener('mousedown', handleNativeMouseDown, true);
      container.removeEventListener('paste', handleNativePaste, true);
    };
  }, [handleSelectImage, uploadAndInsertImage]);

  // Viền highlight cho ảnh đang được chọn
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
    <div className={`rich-text-editor-wrapper ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text block mb-1.5">
          {label} {error && <span className="text-error text-xs font-normal ml-1">({error})</span>}
        </label>
      )}

      <div
        ref={containerRef}
        className={`rich-text-editor relative ${error ? 'is-invalid' : ''}`}
      >
        {/* ═══ THANH ĐIỀU KHIỂN GẮN TRỰC TIẾP VÀO TOOLBAR (WORD STYLE) ═══ */}
        <div className="relative pointer-events-none h-0 z-20">
          <div className="flex absolute top-2 right-3 sm:right-3.5 z-30 pointer-events-auto items-center gap-1.5">
              <button
                type="button"
                onClick={toggleBulletLibrary}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-all border cursor-pointer shadow-2xs ${
                  showBulletLibrary
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-white hover:bg-primary/10 text-gray-700 hover:text-primary border-gray-300'
                }`}
                title={t('admin.editor.bulletLibrary', 'Bullet Library')}
              >
                <ListPlus className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">{t('admin.editor.bulletLibrary', 'Bullet Library')}</span>
                <span className="inline sm:hidden">Bullet</span>
                <ChevronDown
                  className={`w-3 h-3 opacity-70 transition-transform duration-200 ${
                    showBulletLibrary ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={toggleImageDesign}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-all border cursor-pointer shadow-2xs ${
                  showImageDesign
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : selectedImg
                    ? 'bg-blue-50 text-primary border-primary/50 ring-1 ring-primary/30'
                    : 'bg-white hover:bg-primary/10 text-gray-700 hover:text-primary border-gray-300'
                }`}
                title={t('admin.editor.designImage', 'Design image')}
              >
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">{t('admin.editor.designImage', 'Design image')}</span>
                <span className="inline sm:hidden">Design</span>
                {selectedImg && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                <ChevronDown
                  className={`w-3 h-3 opacity-70 transition-transform duration-200 ${
                    showImageDesign ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

          {/* ═══ EXPANDED BULLET LIBRARY PANEL ═══ */}
          {showBulletLibrary && (
            <div
              className="bullet-library-bar absolute right-2 sm:right-2 left-2 sm:left-auto z-30 pointer-events-auto bg-white border border-border shadow-xl rounded-xl p-2.5 animate-in fade-in slide-in-from-top-1 duration-150 max-w-sm"
              style={{ top: `${toolbarHeight + 4}px` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-border/60">
                <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <ListPlus className="w-3.5 h-3.5" />
                  {t('admin.editor.bulletLibrary', 'Bullet Library')}:
                </span>
                <button
                  type="button"
                  onClick={() => setShowBulletLibrary(false)}
                  className="w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-surface-alt transition-all cursor-pointer"
                  title={t('admin.editor.close', 'Đóng')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {BULLET_LIBRARY.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => insertBulletSymbol(item.symbol)}
                    title={t(item.i18nKey, item.title)}
                    className="h-8 min-w-[34px] px-2 flex items-center justify-center bg-surface hover:bg-primary/10 hover:border-primary hover:text-primary text-xs font-bold rounded-lg border border-border/80 shadow-2xs transition-all cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ EXPANDED DESIGN IMAGE PANEL (RESPONSIVE SINGLE ROW) ═══ */}
          {showImageDesign && (
            <div
              className="image-toolbar absolute left-1 sm:left-2 right-1 sm:right-2 z-30 pointer-events-auto bg-white border border-primary/40 rounded-xl px-2 sm:px-2.5 py-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150 touch-pan-x"
              style={{ top: `${toolbarHeight + 4}px` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 flex-nowrap overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap shrink-0">
                  <span className="text-[11px] font-extrabold text-primary flex items-center gap-1 uppercase tracking-wide bg-primary/15 px-2 py-0.5 rounded-md shrink-0">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('admin.editor.designImage', 'Design image')}:</span>
                  </span>

                  {/* Căn lề / Trôi chữ */}
                  <div className="flex items-center gap-0.5 bg-surface-alt p-0.5 rounded-lg border border-border shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() => applyAlignment('right')}
                      className={`h-6 px-1.5 sm:px-2 flex items-center gap-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                        imgAlign === 'right'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-text hover:bg-surface hover:text-primary'
                      }`}
                      title={t('admin.editor.alignRightTitle', 'Trôi sang phải')}
                    >
                      <AlignRight className="w-3 h-3" />
                      <span className="hidden md:inline">{t('admin.editor.alignRight', 'Trôi phải')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyAlignment('left')}
                      className={`h-6 px-1.5 sm:px-2 flex items-center gap-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                        imgAlign === 'left'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-text hover:bg-surface hover:text-primary'
                      }`}
                      title={t('admin.editor.alignLeftTitle', 'Trôi sang trái')}
                    >
                      <AlignLeft className="w-3 h-3" />
                      <span className="hidden md:inline">{t('admin.editor.alignLeft', 'Trôi trái')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyAlignment('center')}
                      className={`h-6 px-1.5 sm:px-2 flex items-center gap-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                        imgAlign === 'center'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-text hover:bg-surface hover:text-primary'
                      }`}
                      title={t('admin.editor.alignCenterTitle', 'Căn giữa')}
                    >
                      <AlignCenter className="w-3 h-3" />
                      <span className="hidden md:inline">{t('admin.editor.alignCenter', 'Giữa')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyAlignment('inline')}
                      className={`h-6 px-1.5 flex items-center gap-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                        imgAlign === 'inline'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-text hover:bg-surface hover:text-primary'
                      }`}
                      title={t('admin.editor.alignInlineTitle', 'Mặc định')}
                    >
                      <AlignJustify className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Kích thước */}
                  <div className="flex items-center gap-0.5 bg-surface-alt p-0.5 rounded-lg border border-border shadow-2xs shrink-0">
                    <span className="text-[10px] font-bold text-text-muted px-1">{t('admin.editor.size', 'Size')}:</span>
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
                        className={`h-6 px-1 sm:px-1.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                          imgSize === s.val
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-text hover:bg-surface hover:text-primary'
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
                    className={`h-7 px-1.5 sm:px-2 flex items-center gap-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer shrink-0 ${
                      hasFrame
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-surface text-text border-border hover:border-amber-500 hover:text-amber-600'
                    }`}
                    title={t('admin.editor.frameTitle', 'Bật/Tắt khung viền trắng và bóng đổ nghệ thuật')}
                  >
                    <Frame className="w-3 h-3" />
                    <span>{t('admin.editor.frame', 'Khung ảnh')} {hasFrame ? '✓' : ''}</span>
                  </button>
                </div>

                {/* Nhóm nút xóa và đóng nằm cùng 1 hàng */}
                <div className="flex items-center gap-1 shrink-0 ml-auto">
                  <button
                    type="button"
                    onClick={deleteSelectedImage}
                    className="h-7 px-2 flex items-center gap-1 text-[11px] font-bold rounded-lg bg-error/10 text-error hover:bg-error hover:text-white border border-error/20 transition-all cursor-pointer shrink-0"
                    title={t('admin.editor.deleteImage', 'Xóa ảnh')}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">{t('admin.editor.deleteImage', 'Xóa ảnh')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowImageDesign(false)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-surface text-text-muted hover:text-text border border-border hover:bg-surface-hover transition-all text-xs font-bold cursor-pointer shrink-0"
                    title={t('admin.editor.close', 'Đóng')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══ VÙNG NỘI DUNG SOẠN THẢO (WORD STYLE: THANH CÔNG CỤ CỐ ĐỊNH, NỘI DUNG CUỘN BÊN DƯỚI) ═══ */}
        {ReactQuill ? (
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder || t('admin.editor.placeholder', 'Nhập nội dung chi tiết...')}
            formats={formats}
            modules={modules}
            className="bg-transparent rounded-lg [&_.ql-toolbar]:bg-white [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:pr-[160px] sm:[&_.ql-toolbar]:pr-[250px] [&_.ql-container]:rounded-b-xl"
            style={{
              '--editor-min-height': minHeight,
            }}
          />
        ) : (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={5}
            className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder={placeholder || t('admin.editor.placeholder', 'Nhập nội dung chi tiết...')}
          />
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;

