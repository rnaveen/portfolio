(function () {
  "use strict";

  const TABS = [
    { id: "consulting", label: "Technology & Consulting", icon: "ti-building-bank" },
    { id: "skills", label: "Skills", icon: "ti-code" },
    { id: "timeline", label: "Timeline", icon: "ti-timeline" },
    { id: "projects", label: "Projects", icon: "ti-folder" },
    { id: "beyond", label: "Beyond work", icon: "ti-heart" },
  ];

  const state = {
    data: null,
    activeTab: "consulting",
    expandedCompetency: null,
    mobilePanelIndex: 0,
  };

  const headerEl = document.getElementById("dash-header");
  const navEl = document.getElementById("dash-nav");
  const mainEl = document.getElementById("dash-main");

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatYears(years) {
    const n = Number(years);
    if (!n) return "0 yrs";
    return n === 1 ? "1 yr" : `${n} yrs`;
  }

  function formatItemYears(item) {
    if (item.years > 0) return `${formatYears(item.years)} experience`;
    if (item.status === "active") return "Active · current";
    return null;
  }

  function setHeaderHeight() {
    document.documentElement.style.setProperty(
      "--header-h",
      headerEl.offsetHeight + "px"
    );
  }

  function renderHeader(profile) {
    document.getElementById("profile-name").textContent = profile.name || "";
    document.getElementById("profile-headline").textContent =
      profile.headline || "";
    const contact = [];
    if (profile.email) {
      contact.push(
        `<a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a>`
      );
    }
    if (profile.phone) contact.push(escapeHtml(profile.phone));
    if (profile.location) contact.push(escapeHtml(profile.location));
    document.getElementById("profile-contact").innerHTML = contact.join(" · ");
    setHeaderHeight();
  }

  function renderLandingIntro(profile) {
    const paragraphs = profile.intro_paragraphs || [];
    if (!paragraphs.length) return "";
    return `
      <div class="landing-intro">
        ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
      </div>`;
  }

  function renderDomains(domains) {
    return `
      <div class="card-grid">
        ${domains
          .map(
            (d) => `
          <article class="domain-card" style="--card-color: ${escapeHtml(d.color_hex)}">
            <i class="ti ${escapeHtml(d.icon)}"></i>
            <h3>${escapeHtml(d.title)}</h3>
            <p>${escapeHtml(d.subtitle)}</p>
            <p class="domain-years">${formatYears(d.years)} experience</p>
          </article>`
          )
          .join("")}
      </div>`;
  }

  function renderCoreCompetencies(data) {
    const comp = data.core_competencies;
    if (!comp || !comp.categories) return "";

    return `
      <h2 class="section-heading competency-heading">${escapeHtml(comp.heading || "CORE COMPETENCIES")}</h2>
      <div class="competency-grid">
        ${comp.categories
          .map((cat) => {
            const isExpanded = state.expandedCompetency === cat.id;
            return `
          <article class="competency-card${isExpanded ? " expanded" : ""}" data-competency="${escapeHtml(cat.id)}">
            <button type="button" class="competency-toggle" aria-expanded="${isExpanded}">
              <h3>${escapeHtml(cat.title)}</h3>
              <p class="competency-summary">${escapeHtml(cat.summary)}</p>
            </button>
            <div class="competency-items">
              <ul>
                ${cat.items
                  .map((item) => {
                    const yearsLabel = formatItemYears(item);
                    const highlightClass = item.highlight ? " highlight-item" : "";
                    return `
                  <li class="competency-item${highlightClass}">
                    <span class="competency-item-label">${escapeHtml(item.label)}</span>
                    ${yearsLabel ? `<span class="competency-item-years">${escapeHtml(yearsLabel)}</span>` : ""}
                  </li>`;
                  })
                  .join("")}
              </ul>
            </div>
          </article>`;
          })
          .join("")}
      </div>`;
  }

  function renderConsulting(data) {
    return `
      ${renderLandingIntro(data.profile)}
      <section class="dash-section">
        <h2 class="section-heading"><i class="ti ti-building-bank"></i> Domain expertise</h2>
        ${renderDomains(data.domain_expertise)}
      </section>`;
  }

  function renderTimeline(entries) {
    return `
      <div class="timeline">
        ${entries
          .map(
            (e) => `
          <article class="timeline-entry${e.openByDefault ? " open" : ""}"
            style="--entry-color: ${escapeHtml(e.color)}">
            <button class="timeline-toggle" type="button" aria-expanded="${e.openByDefault}">
              <div class="period">${escapeHtml(e.period)}</div>
              <div class="role-title">${escapeHtml(e.role)}</div>
              <div class="org">${escapeHtml(e.org)}</div>
            </button>
            <div class="timeline-body">
              <p>${escapeHtml(e.detail)}</p>
              ${
                e.skills_used && e.skills_used.length
                  ? `<div class="skill-tags">${e.skills_used
                      .map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`)
                      .join("")}</div>`
                  : ""
              }
            </div>
          </article>`
          )
          .join("")}
      </div>`;
  }

  function renderProjects(projects) {
    if (!projects || !projects.length) {
      return "<p class='loading'>No projects yet.</p>";
    }

    const statusLabel = {
      in_progress: "In progress",
      planned: "Planned",
    };

    return `
      <div class="table-wrap">
        <table class="projects-table">
          <thead>
            <tr>
              <th scope="col">Project</th>
              <th scope="col">Description</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            ${projects
              .map((p) => {
                const status = p.status || "in_progress";
                const tagClass =
                  status === "planned" ? "tag tag--planned" : "tag";
                return `
              <tr>
                <td>${escapeHtml(p.title)}</td>
                <td>${escapeHtml(p.description)}</td>
                <td><span class="${tagClass}">${escapeHtml(statusLabel[status] || status)}</span></td>
              </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>`;
  }

  function renderInterests(interests) {
    return `
      <div class="card-grid">
        ${interests
          .map(
            (h) => `
          <article class="interest-card">
            ${h.generated ? '<span class="draft-badge">Draft</span>' : ""}
            <i class="ti ${escapeHtml(h.icon)}"></i>
            <h3>${escapeHtml(h.title)}</h3>
            <p>${escapeHtml(h.description)}</p>
          </article>`
          )
          .join("")}
      </div>`;
  }

  function renderTabContent(tabId) {
    const d = state.data;
    switch (tabId) {
      case "consulting":
        return renderConsulting(d);
      case "skills":
        return renderCoreCompetencies(d);
      case "timeline":
        return `<h2 class="section-heading"><i class="ti ti-timeline"></i> Career timeline</h2>${renderTimeline(d.timeline)}`;
      case "projects":
        return `<h2 class="section-heading"><i class="ti ti-folder"></i> Projects</h2><p class="section-lead">What I am building in parallel — learning by shipping.</p>${renderProjects(d.projects)}`;
      case "beyond":
        return `<h2 class="section-heading"><i class="ti ti-heart"></i> Beyond work</h2>${renderInterests(d.interests)}`;
      default:
        return "";
    }
  }

  function renderNav() {
    navEl.innerHTML = `
      <div class="nav-inner">
        ${TABS.map((tab) => {
          const active = state.activeTab === tab.id;
          return `<button type="button" class="nav-tab${active ? " active" : ""}"
            data-tab="${escapeHtml(tab.id)}"
            aria-current="${active ? "page" : "false"}">
            <i class="ti ${escapeHtml(tab.icon)}"></i>
            <span>${escapeHtml(tab.label)}</span>
          </button>`;
        }).join("")}
      </div>`;

    navEl.querySelectorAll(".nav-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeTab = btn.dataset.tab;
        state.expandedCompetency = null;
        state.mobilePanelIndex = TABS.findIndex((t) => t.id === btn.dataset.tab);
        render();
      });
    });
  }

  function renderMobileCarousel() {
    const panels = TABS.map(
      (tab, i) => `
      <div class="swipe-panel${i === state.mobilePanelIndex ? " active" : ""}" data-panel="${i}">
        ${renderTabContent(tab.id)}
      </div>`
    ).join("");

    return `
      <p class="swipe-hint">Swipe left or right to explore</p>
      <div class="mobile-nav-dots">
        ${TABS.map(
          (_, i) =>
            `<button type="button" class="mobile-nav-dot${i === state.mobilePanelIndex ? " active" : ""}" data-dot="${i}" aria-label="${escapeHtml(TABS[i].label)}"></button>`
        ).join("")}
      </div>
      <div class="swipe-container" id="swipe-container">${panels}</div>`;
  }

  function bindTimelineAccordion() {
    if (!mainEl) return;
    mainEl.querySelectorAll(".timeline-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const entry = btn.closest(".timeline-entry");
        const wasOpen = entry.classList.contains("open");
        mainEl.querySelectorAll(".timeline-entry").forEach((el) => {
          el.classList.remove("open");
          el.querySelector(".timeline-toggle")?.setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          entry.classList.add("open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function bindCompetencyCards() {
    if (!mainEl) return;
    mainEl.querySelectorAll(".competency-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".competency-card");
        const id = card?.dataset.competency;
        state.expandedCompetency = state.expandedCompetency === id ? null : id;
        renderMain();
      });
    });
  }

  function bindMobileSwipe() {
    const container = document.getElementById("swipe-container");
    if (!container) return;

    const dots = mainEl.querySelectorAll(".mobile-nav-dot");
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const idx = parseInt(dot.dataset.dot, 10);
        state.mobilePanelIndex = idx;
        state.activeTab = TABS[idx].id;
        state.expandedCompetency = null;
        const panel = container.children[idx];
        if (panel) panel.scrollIntoView({ behavior: "smooth", inline: "start" });
        dots.forEach((d, i) => d.classList.toggle("active", i === idx));
        renderNav();
      });
    });

    let scrollTimeout;
    container.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const w = container.offsetWidth;
        const idx = Math.round(container.scrollLeft / w);
        if (idx !== state.mobilePanelIndex) {
          state.mobilePanelIndex = idx;
          state.activeTab = TABS[idx].id;
          state.expandedCompetency = null;
          dots.forEach((d, i) => d.classList.toggle("active", i === idx));
          renderNav();
        }
      }, 80);
    });
  }

  function renderMain() {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    if (isMobile) {
      mainEl.innerHTML = renderMobileCarousel();
    } else {
      mainEl.innerHTML = `<div class="tab-panel active">${renderTabContent(state.activeTab)}</div>`;
    }

    bindTimelineAccordion();
    bindCompetencyCards();
    bindMobileSwipe();
  }

  function render() {
    renderNav();
    renderMain();
  }

  async function init() {
    try {
      const res = await fetch("data/resume_dashboard.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.data = await res.json();
      renderHeader(state.data.profile);
      render();
      window.addEventListener("resize", () => {
        setHeaderHeight();
        renderMain();
      });
    } catch (err) {
      mainEl.innerHTML = `<p class="error">Failed to load resume data. Run <code>python3 scripts/build_resume_data.py</code> and serve via HTTP.<br>${escapeHtml(err.message)}</p>`;
    }
  }

  init();
})();
