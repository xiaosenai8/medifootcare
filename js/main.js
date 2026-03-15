/**
 * メディフットケア - main.js
 * ハンバーガーメニュー / ドロップダウン / アコーディオン / タブ
 * スクロールアニメーション / フォームバリデーション
 */

'use strict';

/* ----------------------------------------------------------
   DOM Ready
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  initHamburger();
  initDropdown();
  initAccordion();
  initTabs();
  initScrollHeader();
  initScrollAnimation();
  initFormValidation();
});

/* ----------------------------------------------------------
   ハンバーガーメニュー
   ---------------------------------------------------------- */
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', function () {
    const isActive = hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : '';
    hamburger.setAttribute('aria-expanded', String(isActive));
  });

  // モバイルメニュー内のリンクをクリックしたら閉じる
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // 画面リサイズ時に閉じる
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024) {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* ----------------------------------------------------------
   ドロップダウンナビゲーション
   ---------------------------------------------------------- */
function initDropdown() {
  const navItems = document.querySelectorAll('.nav__item');

  navItems.forEach(function (item) {
    const dropdown = item.querySelector('.dropdown');
    if (!dropdown) return;

    let hideTimer;

    item.addEventListener('mouseenter', function () {
      clearTimeout(hideTimer);
      item.classList.add('active');
    });

    item.addEventListener('mouseleave', function () {
      hideTimer = setTimeout(function () {
        item.classList.remove('active');
      }, 150);
    });

    dropdown.addEventListener('mouseenter', function () {
      clearTimeout(hideTimer);
    });

    dropdown.addEventListener('mouseleave', function () {
      hideTimer = setTimeout(function () {
        item.classList.remove('active');
      }, 150);
    });
  });

  // 外側クリックで閉じる
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav__item')) {
      navItems.forEach(function (item) {
        item.classList.remove('active');
      });
    }
  });
}

/* ----------------------------------------------------------
   アコーディオン（FAQ）
   ---------------------------------------------------------- */
function initAccordion() {
  const triggers = document.querySelectorAll('.accordion__trigger');

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const content = trigger.nextElementSibling;
      const isActive = trigger.classList.contains('active');

      // 同じグループ内の他を閉じる（オプション: コメントアウトで複数開放可）
      const accordion = trigger.closest('.accordion');
      if (accordion) {
        accordion.querySelectorAll('.accordion__trigger.active').forEach(function (other) {
          if (other !== trigger) {
            other.classList.remove('active');
            const otherContent = other.nextElementSibling;
            if (otherContent) {
              otherContent.classList.remove('active');
            }
          }
        });
      }

      trigger.classList.toggle('active', !isActive);
      if (content) {
        content.classList.toggle('active', !isActive);
      }
    });
  });
}

/* ----------------------------------------------------------
   タブ切り替え
   ---------------------------------------------------------- */
function initTabs() {
  const tabGroups = document.querySelectorAll('.tabs');

  tabGroups.forEach(function (group) {
    const buttons = group.querySelectorAll('.tabs__btn');
    const panels = group.querySelectorAll('.tabs__panel');

    buttons.forEach(function (btn, index) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });

        btn.classList.add('active');
        if (panels[index]) {
          panels[index].classList.add('active');
        }
      });
    });

    // 初期表示：最初のタブをアクティブに
    if (buttons.length > 0 && !group.querySelector('.tabs__btn.active')) {
      buttons[0].classList.add('active');
      if (panels[0]) panels[0].classList.add('active');
    }
  });
}

/* ----------------------------------------------------------
   スクロールでヘッダーに影
   ---------------------------------------------------------- */
function initScrollHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        if (window.scrollY > 8) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ----------------------------------------------------------
   スクロールアニメーション（IntersectionObserver）
   ---------------------------------------------------------- */
function initScrollAnimation() {
  const elements = document.querySelectorAll('.fade-in');
  if (elements.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    // フォールバック: 全表示
    elements.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(function (el) { observer.observe(el); });
}

/* ----------------------------------------------------------
   フォームバリデーション
   ---------------------------------------------------------- */
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      const isValid = validateForm(form);
      if (!isValid) {
        e.preventDefault();
        // 最初のエラー要素へスクロール
        const firstError = form.querySelector('.form__input.error, .form__textarea.error, .form__select.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
      }
    });

    // リアルタイムバリデーション（フォーカスアウト時）
    form.querySelectorAll('[required]').forEach(function (field) {
      field.addEventListener('blur', function () {
        validateField(field);
      });

      field.addEventListener('input', function () {
        if (field.classList.contains('error')) {
          validateField(field);
        }
      });
    });
  });
}

function validateForm(form) {
  let isValid = true;
  const fields = form.querySelectorAll('[required]');

  fields.forEach(function (field) {
    if (!validateField(field)) {
      isValid = false;
    }
  });

  // プライバシーポリシー同意チェック
  const privacyCheck = form.querySelector('[name="privacy"]');
  if (privacyCheck && !privacyCheck.checked) {
    isValid = false;
    showFieldError(privacyCheck, 'プライバシーポリシーへの同意が必要です');
  }

  return isValid;
}

function validateField(field) {
  const value = field.value.trim();
  const type = field.type;
  let isValid = true;
  let message = '';

  // 空チェック
  if (field.required && value === '') {
    isValid = false;
    message = 'この項目は必須です';
  }
  // メールアドレスチェック
  else if (type === 'email' && value !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      message = '正しいメールアドレスを入力してください';
    }
  }
  // 電話番号チェック（任意だが入力時）
  else if (type === 'tel' && value !== '') {
    const telRegex = /^[\d\-\+\(\)\s]{10,15}$/;
    if (!telRegex.test(value.replace(/\s/g, ''))) {
      isValid = false;
      message = '正しい電話番号を入力してください';
    }
  }

  if (!isValid) {
    showFieldError(field, message);
  } else {
    clearFieldError(field);
  }

  return isValid;
}

function showFieldError(field, message) {
  field.classList.add('error');
  const group = field.closest('.form__group');
  if (group) {
    let errorMsg = group.querySelector('.form__error-msg');
    if (!errorMsg) {
      errorMsg = document.createElement('p');
      errorMsg.className = 'form__error-msg';
      field.parentNode.insertBefore(errorMsg, field.nextSibling);
    }
    errorMsg.textContent = message;
    errorMsg.classList.add('visible');
  }
}

function clearFieldError(field) {
  field.classList.remove('error');
  const group = field.closest('.form__group');
  if (group) {
    const errorMsg = group.querySelector('.form__error-msg');
    if (errorMsg) {
      errorMsg.classList.remove('visible');
    }
  }
}
