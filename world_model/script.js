const slides = Array.from(document.querySelectorAll(".slide"));
const slideTrack = document.getElementById("slides");
const currentSlide = document.getElementById("currentSlide");
const totalSlides = document.getElementById("totalSlides");
const progressBar = document.getElementById("progressBar");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const railItems = Array.from(document.querySelectorAll(".rail-item"));
const overview = document.getElementById("overview");
const overviewGrid = document.getElementById("overviewGrid");
const overviewButton = document.getElementById("overviewButton");
const closeOverview = document.getElementById("closeOverview");
const stage = document.querySelector(".stage");

let index = 0;
let wheelLock = false;
let activeLayoutDrag = null;
let selectedLayoutItem = null;

totalSlides.textContent = String(slides.length);

function sectionForSlide(slideIndex) {
  return slides[slideIndex]?.dataset.section || "";
}

function nearestRailIndex(slideIndex) {
  let active = 0;
  railItems.forEach((item, itemIndex) => {
    const jump = Number(item.dataset.jump || 0);
    if (slideIndex >= jump) active = itemIndex;
  });
  return active;
}

function updateHash() {
  const slug = (slides[index]?.dataset.title || `slide-${index + 1}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  history.replaceState(null, "", `#${String(index + 1).padStart(2, "0")}-${slug}`);
}

function goTo(nextIndex, pushHash = true) {
  index = Math.max(0, Math.min(slides.length - 1, nextIndex));
  slideTrack.style.setProperty("--slide-index", index);
  currentSlide.textContent = String(index + 1);
  progressBar.style.width = `${((index + 1) / slides.length) * 100}%`;
  prevButton.disabled = index === 0;
  nextButton.disabled = index === slides.length - 1;

  railItems.forEach((item, itemIndex) => {
    item.classList.toggle("is-active", itemIndex === nearestRailIndex(index));
  });

  slides.forEach((slide, slideIndex) => {
    slide.toggleAttribute("aria-current", slideIndex === index);
  });

  if (pushHash) updateHash();
}

function next() {
  goTo(index + 1);
}

function previous() {
  goTo(index - 1);
}

function isInteractiveTarget(target) {
  return Boolean(
    target.closest("button, a, summary, details, input, textarea, select, .overview, .meta-toggle, .digital-human-gallery, .draggable-item, .layout-controls")
  );
}

function canScrollCurrentSlide(target, deltaY) {
  const targetScroller = target.closest(".slide-inner");
  const scroller = targetScroller || slides[index]?.querySelector(".slide-inner");
  if (!scroller) return false;
  const maxScroll = scroller.scrollHeight - scroller.clientHeight;
  if (maxScroll <= 2) return false;
  if (deltaY > 0 && scroller.scrollTop < maxScroll - 2) {
    if (!targetScroller) scroller.scrollTop = Math.min(maxScroll, scroller.scrollTop + deltaY);
    return true;
  }
  if (deltaY < 0 && scroller.scrollTop > 2) {
    if (!targetScroller) scroller.scrollTop = Math.max(0, scroller.scrollTop + deltaY);
    return true;
  }
  return false;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function itemLayout(item, fallbackIndex = 0) {
  const style = item.style;
  return {
    id: item.dataset.itemId,
    x: parseNumber(style.getPropertyValue("--x"), parseNumber(item.dataset.x, 0)),
    y: parseNumber(style.getPropertyValue("--y"), parseNumber(item.dataset.y, 0)),
    w: parseNumber(style.getPropertyValue("--w"), parseNumber(item.dataset.w, 30)),
    h: parseNumber(style.getPropertyValue("--h"), parseNumber(item.dataset.h, 24)),
    z: parseNumber(style.getPropertyValue("--z"), parseNumber(item.dataset.z, fallbackIndex + 1)),
    scale: parseNumber(style.getPropertyValue("--scale"), parseNumber(item.dataset.scale, 1)),
    rotate: parseNumber(style.getPropertyValue("--rotate"), parseNumber(item.dataset.rotate, 0))
  };
}

function defaultItemLayout(item, fallbackIndex = 0) {
  return {
    id: item.dataset.itemId,
    x: parseNumber(item.dataset.x, 0),
    y: parseNumber(item.dataset.y, 0),
    w: parseNumber(item.dataset.w, 30),
    h: parseNumber(item.dataset.h, 24),
    z: parseNumber(item.dataset.z, fallbackIndex + 1),
    scale: parseNumber(item.dataset.scale, 1),
    rotate: parseNumber(item.dataset.rotate, 0)
  };
}

function setItemLayout(item, layout) {
  item.style.setProperty("--x", String(layout.x));
  item.style.setProperty("--y", String(layout.y));
  item.style.setProperty("--w", String(layout.w));
  item.style.setProperty("--h", String(layout.h));
  item.style.setProperty("--z", String(layout.z));
  item.style.setProperty("--scale", String(layout.scale));
  item.style.setProperty("--rotate", String(layout.rotate));
}

function layoutStorageKey(gallery) {
  return `yang-zhou-research-deck:${gallery.dataset.layoutKey}:layout:v1`;
}

function readSavedLayout(gallery) {
  try {
    const raw = window.localStorage.getItem(layoutStorageKey(gallery));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.items) ? parsed.items : null;
  } catch {
    return null;
  }
}

function writeSavedLayout(gallery) {
  const items = Array.from(gallery.querySelectorAll(".draggable-item")).map(itemLayout);
  try {
    window.localStorage.setItem(layoutStorageKey(gallery), JSON.stringify({ items }));
    setLayoutStatus(gallery, "Saved");
  } catch {
    setLayoutStatus(gallery, "Not saved");
  }
}

function clearSavedLayout(gallery) {
  try {
    window.localStorage.removeItem(layoutStorageKey(gallery));
  } catch {
    // Ignore storage errors; the reset still applies to the live layout.
  }
  applyGalleryLayout(gallery, null);
  setLayoutStatus(gallery, "Reset");
}

function setLayoutStatus(gallery, message) {
  const status = gallery.querySelector(".layout-status");
  if (!status) return;
  window.clearTimeout(status._clearTimer);
  status.textContent = message;
  status._clearTimer = window.setTimeout(() => {
    status.textContent = "";
  }, 1600);
}

function applyGalleryLayout(gallery, savedItems) {
  const savedById = new Map((savedItems || []).map((item) => [item.id, item]));
  Array.from(gallery.querySelectorAll(".draggable-item")).forEach((item, itemIndex) => {
    const fallback = defaultItemLayout(item, itemIndex);
    const saved = savedById.get(fallback.id);
    const layout = saved
      ? {
          id: fallback.id,
          x: parseNumber(saved.x, fallback.x),
          y: parseNumber(saved.y, fallback.y),
          w: parseNumber(saved.w, fallback.w),
          h: parseNumber(saved.h, fallback.h),
          z: parseNumber(saved.z, fallback.z),
          scale: parseNumber(saved.scale, fallback.scale),
          rotate: parseNumber(saved.rotate, fallback.rotate)
        }
      : fallback;
    setItemLayout(item, {
      ...layout,
      x: clamp(layout.x, 0, 100 - layout.w),
      y: clamp(layout.y, 0, 100 - layout.h),
      scale: clamp(layout.scale, 0.2, 3),
      rotate: clamp(layout.rotate, -180, 180)
    });
  });
}

function syncTransformControls(gallery) {
  const scaleInput = gallery.querySelector(".layout-scale");
  const rotateInput = gallery.querySelector(".layout-rotate");
  const hasSelection = Boolean(selectedLayoutItem && gallery.contains(selectedLayoutItem));
  if (!scaleInput || !rotateInput) return;
  scaleInput.disabled = !hasSelection;
  rotateInput.disabled = !hasSelection;
  if (!hasSelection) return;
  const layout = itemLayout(selectedLayoutItem);
  scaleInput.value = String(clamp(layout.scale, 0.2, 3));
  rotateInput.value = String(clamp(layout.rotate, -180, 180));
}

function selectLayoutItem(item) {
  if (!item) return;
  const gallery = item.closest(".digital-human-gallery");
  if (!gallery) return;
  gallery.querySelectorAll(".draggable-item").forEach((node) => {
    node.classList.toggle("is-selected", node === item);
  });
  selectedLayoutItem = item;
  syncTransformControls(gallery);
}

function updateSelectedTransform(gallery) {
  if (!selectedLayoutItem || !gallery.contains(selectedLayoutItem)) return;
  const scaleInput = gallery.querySelector(".layout-scale");
  const rotateInput = gallery.querySelector(".layout-rotate");
  const scale = clamp(parseNumber(scaleInput?.value, 1), 0.2, 3);
  const rotate = clamp(parseNumber(rotateInput?.value, 0), -180, 180);
  selectedLayoutItem.style.setProperty("--scale", scale.toFixed(2));
  selectedLayoutItem.style.setProperty("--rotate", String(Math.round(rotate)));
  const status = gallery.querySelector(".layout-status");
  if (status) status.textContent = "";
}

function bumpLayoutItem(gallery, item) {
  const highestZ = Array.from(gallery.querySelectorAll(".draggable-item")).reduce((max, node) => {
    return Math.max(max, itemLayout(node).z);
  }, 1);
  item.style.setProperty("--z", String(highestZ + 1));
}

function beginLayoutDrag(event) {
  if (event.button !== 0) return;
  const item = event.currentTarget;
  const gallery = item.closest(".digital-human-gallery");
  if (!gallery) return;
  const rect = gallery.getBoundingClientRect();
  const layout = itemLayout(item);
  selectLayoutItem(item);
  activeLayoutDrag = {
    item,
    gallery,
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startX: layout.x,
    startY: layout.y,
    w: layout.w,
    h: layout.h,
    boardWidth: rect.width,
    boardHeight: rect.height
  };
  bumpLayoutItem(gallery, item);
  item.classList.add("is-dragging");
  item.setPointerCapture(event.pointerId);
  event.preventDefault();
  event.stopPropagation();
}

function moveLayoutDrag(event) {
  if (!activeLayoutDrag || event.pointerId !== activeLayoutDrag.pointerId) return;
  const drag = activeLayoutDrag;
  const dx = ((event.clientX - drag.startClientX) / drag.boardWidth) * 100;
  const dy = ((event.clientY - drag.startClientY) / drag.boardHeight) * 100;
  const x = clamp(drag.startX + dx, 0, 100 - drag.w);
  const y = clamp(drag.startY + dy, 0, 100 - drag.h);
  drag.item.style.setProperty("--x", x.toFixed(2));
  drag.item.style.setProperty("--y", y.toFixed(2));
  const status = drag.gallery.querySelector(".layout-status");
  if (status) status.textContent = "";
  event.preventDefault();
}

function endLayoutDrag(event) {
  if (!activeLayoutDrag || event.pointerId !== activeLayoutDrag.pointerId) return;
  const drag = activeLayoutDrag;
  drag.item.classList.remove("is-dragging");
  if (drag.item.hasPointerCapture(event.pointerId)) {
    drag.item.releasePointerCapture(event.pointerId);
  }
  activeLayoutDrag = null;
  event.preventDefault();
}

function initDraggableGalleries() {
  document.querySelectorAll(".digital-human-gallery[data-layout-key]").forEach((gallery) => {
    applyGalleryLayout(gallery, readSavedLayout(gallery));
    const items = Array.from(gallery.querySelectorAll(".draggable-item"));
    items.forEach((item) => {
      item.addEventListener("pointerdown", beginLayoutDrag);
      item.addEventListener("click", () => selectLayoutItem(item));
    });
    selectLayoutItem(items[0]);
    gallery.querySelector(".layout-scale")?.addEventListener("input", () => updateSelectedTransform(gallery));
    gallery.querySelector(".layout-rotate")?.addEventListener("input", () => updateSelectedTransform(gallery));
    gallery.querySelector(".layout-save")?.addEventListener("click", (event) => {
      event.preventDefault();
      writeSavedLayout(gallery);
    });
    gallery.querySelector(".layout-reset")?.addEventListener("click", (event) => {
      event.preventDefault();
      clearSavedLayout(gallery);
      selectLayoutItem(gallery.querySelector(".draggable-item"));
    });
  });
}

function openOverview() {
  overview.classList.add("is-open");
  overview.setAttribute("aria-hidden", "false");
}

function closeOverviewPanel() {
  overview.classList.remove("is-open");
  overview.setAttribute("aria-hidden", "true");
}

function buildOverview() {
  overviewGrid.innerHTML = "";
  slides.forEach((slide, slideIndex) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "overview-card";
    card.innerHTML = `
      <span>${String(slideIndex + 1).padStart(2, "0")}</span>
      <strong>${slide.dataset.title || "Untitled"}</strong>
      <small>${slide.dataset.section || ""}</small>
    `;
    card.addEventListener("click", () => {
      goTo(slideIndex);
      closeOverviewPanel();
    });
    overviewGrid.appendChild(card);
  });
}

function restoreFromHash() {
  const match = window.location.hash.match(/^#?(\d+)/);
  if (!match) return;
  const hashIndex = Number(match[1]) - 1;
  if (Number.isFinite(hashIndex)) goTo(hashIndex, false);
}

railItems.forEach((item) => {
  item.addEventListener("click", () => goTo(Number(item.dataset.jump || 0)));
});

prevButton.addEventListener("click", previous);
nextButton.addEventListener("click", next);
overviewButton.addEventListener("click", openOverview);
closeOverview.addEventListener("click", closeOverviewPanel);

stage.addEventListener("click", (event) => {
  if (!isInteractiveTarget(event.target)) next();
});

document.addEventListener("keydown", (event) => {
  if (event.defaultPrevented) return;
  if (overview.classList.contains("is-open") && event.key === "Escape") {
    closeOverviewPanel();
    return;
  }
  if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault();
    next();
  }
  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    previous();
  }
  if (event.key === "Home") {
    event.preventDefault();
    goTo(0);
  }
  if (event.key === "End") {
    event.preventDefault();
    goTo(slides.length - 1);
  }
  if (/^[1-6]$/.test(event.key)) {
    event.preventDefault();
    const item = railItems[Number(event.key) - 1];
    if (item) goTo(Number(item.dataset.jump || 0));
  }
});

stage.addEventListener(
  "wheel",
  (event) => {
    if (event.target.closest(".digital-human-gallery")) return;
    if (canScrollCurrentSlide(event.target, event.deltaY)) return;
    if (Math.abs(event.deltaY) < 18 || wheelLock) return;
    wheelLock = true;
    if (event.deltaY > 0) next();
    else previous();
    window.setTimeout(() => {
      wheelLock = false;
    }, 780);
  },
  { passive: true }
);

document.addEventListener("pointermove", moveLayoutDrag, { passive: false });
document.addEventListener("pointerup", endLayoutDrag);
document.addEventListener("pointercancel", endLayoutDrag);

stage.addEventListener("pointermove", (event) => {
  const rect = stage.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  document.documentElement.style.setProperty("--mx", x.toFixed(3));
  document.documentElement.style.setProperty("--my", y.toFixed(3));
});

window.addEventListener("hashchange", restoreFromHash);

initDraggableGalleries();
buildOverview();
restoreFromHash();
goTo(index, !window.location.hash);
