export default function decorate(block) {
  // 獲取所有 slide 元素（跳過第一個控制行和導航行）
  const rows = [...block.children];
  const slides = [];

  // 處理表格結構，提取 slides
  rows.forEach((row, index) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const firstCell = cells[0];
      const secondCell = cells[1];

      // 跳過標題行、導航行（>> 和 <<）
      if (
        firstCell.textContent.trim() === ">>" ||
        firstCell.textContent.trim() === "<<" ||
        firstCell.textContent.includes("Carousel")
      ) {
        return;
      }

      // 建立 slide
      const slide = document.createElement("div");
      slide.className = "slide";

      // 如果第一個 cell 有圖片，加入圖片
      const img = firstCell.querySelector("img");
      if (img) {
        slide.appendChild(img.cloneNode(true));
      }

      // 建立內容區域
      const content = document.createElement("div");
      content.className = "slide-content";
      content.innerHTML = secondCell.innerHTML;
      slide.appendChild(content);

      slides.push(slide);
    }
  });

  if (slides.length === 0) {
    console.warn("No slides found in carousel");
    return;
  }

  // 清空原有內容並建立新結構
  block.innerHTML = "";

  // 建立 carousel 容器
  const container = document.createElement("div");
  container.className = "carousel-container";

  const slidesContainer = document.createElement("div");
  slidesContainer.className = "carousel-slides";

  // 添加所有 slides
  slides.forEach((slide) => {
    slidesContainer.appendChild(slide);
  });

  container.appendChild(slidesContainer);

  // 建立導航按鈕
  const prevButton = document.createElement("button");
  prevButton.className = "nav-button prev-button";
  prevButton.innerHTML = "‹";
  prevButton.setAttribute("aria-label", "Previous slide");

  const nextButton = document.createElement("button");
  nextButton.className = "nav-button next-button";
  nextButton.innerHTML = "›";
  nextButton.setAttribute("aria-label", "Next slide");

  container.appendChild(prevButton);
  container.appendChild(nextButton);

  // 建立點點指示器
  const dotsContainer = document.createElement("div");
  dotsContainer.className = "carousel-dots";

  const dots = [];
  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    if (index === 0) dot.classList.add("active");
    dots.push(dot);
    dotsContainer.appendChild(dot);
  });

  block.appendChild(container);
  block.appendChild(dotsContainer);

  // Carousel 邏輯
  let currentSlide = 0;

  function updateSlide() {
    const translateX = -currentSlide * 100;
    slidesContainer.style.transform = `translateX(${translateX}%)`;

    // 更新點點指示器
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentSlide);
    });

    // 更新按鈕狀態
    prevButton.disabled = currentSlide === 0;
    nextButton.disabled = currentSlide === slides.length - 1;
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      updateSlide();
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      currentSlide--;
      updateSlide();
    }
  }

  function goToSlide(index) {
    currentSlide = index;
    updateSlide();
  }

  // 事件監聽器
  nextButton.addEventListener("click", nextSlide);
  prevButton.addEventListener("click", prevSlide);

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => goToSlide(index));
  });

  // 鍵盤支持
  block.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        prevSlide();
        break;
      case "ArrowRight":
        e.preventDefault();
        nextSlide();
        break;
    }
  });

  // 設置 tabindex 使其可以接收鍵盤焦點
  block.setAttribute("tabindex", "0");

  // 自動輪播（可選）
  let autoSlide = null;

  function startAutoSlide() {
    autoSlide = setInterval(() => {
      if (currentSlide < slides.length - 1) {
        nextSlide();
      } else {
        currentSlide = 0;
        updateSlide();
      }
    }, 5000); // 5秒切換一次
  }

  function stopAutoSlide() {
    if (autoSlide) {
      clearInterval(autoSlide);
      autoSlide = null;
    }
  }

  // 鼠標懸停時停止自動輪播
  block.addEventListener("mouseenter", stopAutoSlide);
  block.addEventListener("mouseleave", startAutoSlide);

  // 初始化
  updateSlide();
  startAutoSlide();

  // 支援觸摸滑動（移動設備）
  let touchStartX = 0;
  let touchEndX = 0;

  block.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  block.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true }
  );

  function handleSwipe() {
    const threshold = 50; // 最小滑動距離
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // 向左滑動 - 下一張
        nextSlide();
      } else {
        // 向右滑動 - 上一張
        prevSlide();
      }
    }
  }
}
