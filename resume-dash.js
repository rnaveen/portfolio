(function () {
  "use strict";

  const NAV_SECTIONS = [
    { id: "about", label: "About" },
    { id: "domains", label: "Domains" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "beyond", label: "Beyond work" },
  ];

  const state = { data: null };

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
    console.log("full profile:", profile);
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
    console.log("testing links");
    console.log(profile.phone);
    console.log(profile.github);
    console.log(profile.linkedin);
    /* profile links */
    const links =[];
    if (profile.github){
      links.push(`<a href = "${escapeHtml(profile.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>`        
      );
    }
    if (profile.linkedin){
      links.push(`<a href ="${escapeHtml(profile.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`
      );
    }
    document.getElementById("profile-links").innerHTML = links.join(" . ");


    /* profile photo */
    if (profile.photo){
      
      const photoEl = document.getElementById("profile-photo");
      const btn = document.getElementById("profile-photo_btn")
      photoEl.src = profile.photo;
      photoEl.className = "header-photo";
      photoEl.width = 56;
      photoEl.height = 56;
      btn.hidden = false;
      btn.addEventListener("click", () => {
        const overlay = document.createElement("div");
        overlay.className = "photo-overlay";
        overlay.innerHTML = `<img src="${escapeHtml(profile.photo)}" alt="${escapeHtml(profile.name || "")}">`;
        overlay.addEventListener("click", () => overlay.remove());
        document.body.appendChild(overlay);
      });
     
    }
    
    setHeaderHeight();
  }

  function renderExpandCard({ id, icon, title, summary, meta, body, cardColor }) {
    const style = cardColor ? ` style="--card-color: ${escapeHtml(cardColor)}"` : "";
    return `
      <article class="expand-card" data-expand-id="${escapeHtml(id)}"${style}>
        <button type="button" class="expand-card-toggle" aria-expanded="false">
          ${icon ? `<i class="ti ${escapeHtml(icon)} expand-card-icon"></i>` : ""}
          <div class="expand-card-head">
            <h3>${escapeHtml(title)}</h3>
            <p class="expand-card-summary">${escapeHtml(summary)}</p>
            ${meta ? `<p class="expand-card-meta">${escapeHtml(meta)}</p>` : ""}
          </div>
          <i class="ti ti-chevron-down expand-card-chevron" aria-hidden="true"></i>
        </button>
        <div class="expand-card-body">${body}</div>
      </article>`;
  }

  function renderAbout(profile) {
    const paragraphs = profile.intro_paragraphs || [];
    const photoHtml = profile.photo
      ? `<img class="about-photo" src="${escapeHtml(profile.photo)}" alt="${escapeHtml(profile.name || "")}" width="120" height="120" onerror="this.style.display='none'">`
      : "";

    return `
      <section id="about" class="page-section">
        <div class="about-layout">
          
          <div class="about-text">
            ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
            ${
              profile.impact_callout
                ? `<p class="impact-callout">${escapeHtml(profile.impact_callout)}</p>`
                : ""
            }
          </div>
        </div>
      </section>`;
  }

  function renderDomainsSection(domains) {
    const cards = domains
      .map((d) => {
        const links =
          d.timeline_links && d.timeline_links.length
            ? `<p class="expand-card-links">View in timeline: ${d.timeline_links
                .map(
                  (l) =>
                    `<a href="#role-${escapeHtml(l.id)}">${escapeHtml(l.label)}</a>`
                )
                .join(" · ")}</p>`
            : "";
        const body = `<p>${escapeHtml(d.detail || "")}</p>${links}`;
        return renderExpandCard({
          id: d.id,
          icon: d.icon,
          title: d.title,
          summary: d.subtitle,
          meta: `${formatYears(d.years)} experience`,
          body,
          cardColor: d.color_hex,
        });
      })
      .join("");

    return `
      <section id="domains" class="page-section">
        <h2 class="section-heading"><i class="ti ti-building-bank"></i> Domain expertise</h2>
        <div class="expand-card-grid expand-card-section">${cards}</div>
      </section>`;
  }

  function renderSkillsSection(data) {
    const comp = data.core_competencies;
    if (!comp || !comp.categories) return "";

    const cards = comp.categories
      .map((cat) => {
        const itemsHtml = `
          <ul class="competency-item-list">
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
          </ul>`;
        return renderExpandCard({
          id: cat.id,
          icon: "ti-code",
          title: cat.title,
          summary: cat.summary,
          meta: null,
          body: itemsHtml,
        });
      })
      .join("");

    return `
      <section id="skills" class="page-section">
        <h2 class="section-heading competency-heading">${escapeHtml(comp.heading || "CORE COMPETENCIES")}</h2>
        <div class="expand-card-grid expand-card-section">${cards}</div>
      </section>`;
  }

  function renderExperienceSection(entries) {
    return `
      <section id="experience" class="page-section">
        <h2 class="section-heading"><i class="ti ti-timeline"></i> Career timeline</h2>
        <div class="timeline">
          ${entries
            .map(
              (e) => `
            <article id="role-${escapeHtml(e.id)}" class="timeline-entry${e.openByDefault ? " open" : ""}"
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
        </div>
      </section>`;
  }

  function renderProjectsSection(projects) {
    if (!projects || !projects.length) {
      return `
        <section id="projects" class="page-section">
          <h2 class="section-heading"><i class="ti ti-folder"></i> Projects</h2>
          <p class="loading">No projects yet.</p>
        </section>`;
    }

    const statusLabel = {
      in_progress: "In progress",
      planned: "Planned",
    };

    return `
      <section id="projects" class="page-section">
        <h2 class="section-heading"><i class="ti ti-folder"></i> Projects</h2>
        <p class="section-lead">What I am building in parallel — learning by shipping.</p>
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
                  const statusClass =
                    status === "planned" ? "tag tag--planned" : "tag";
                  const tagClass = `tag tag--${escapeHtml(p.tag || "learning")}`;
                  return `
                <tr>
                  <td>${escapeHtml(p.title)}</td>
                  <td>${escapeHtml(p.description)}</td>
                  <td class="project-tags-cell">
                    <span class="${statusClass}">${escapeHtml(statusLabel[status] || status)}</span>
                    <span class="${tagClass}">${escapeHtml(p.tag_label || "")}</span>
                  </td>
                </tr>`;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      </section>`;
  }

  function renderBeyondSection(interests) {
    const cards = interests
      .map((h) => {
        const short =
          h.description.length > 72
            ? `${h.description.slice(0, 69)}…`
            : h.description;
        return renderExpandCard({
          id: h.id,
          icon: h.icon,
          title: h.title,
          summary: short,
          meta: null,
          body: `<p>${escapeHtml(h.description)}</p>`,
          cardColor: null,
        });
      })
      .join("");

    return `
      <section id="beyond" class="page-section">
        <h2 class="section-heading"><i class="ti ti-heart"></i> Beyond work</h2>
        <div class="expand-card-grid expand-card-section">${cards}</div>
      </section>`;
  }

  function renderPage() {
    const d = state.data;
    mainEl.innerHTML = [
      renderAbout(d.profile),
      renderDomainsSection(d.domain_expertise),
      renderSkillsSection(d),
      renderExperienceSection(d.timeline),
      renderProjectsSection(d.projects),
      renderBeyondSection(d.interests),
    ].join("");
  }

  function renderNav() {
    navEl.innerHTML = `
      <div class="nav-inner">
        ${NAV_SECTIONS.map(
          (s) =>
            `<a class="nav-link" href="#${escapeHtml(s.id)}">${escapeHtml(s.label)}</a>`
        ).join("")}
      </div>`;
  }

  function bindInteractions() {
    mainEl.addEventListener("click", (e) => {
      const toggle = e.target.closest(".expand-card-toggle");
      if (toggle) {
        const card = toggle.closest(".expand-card");
        const section = toggle.closest(".expand-card-section");
        if (!card || !section) return;

        const wasExpanded = card.classList.contains("expanded");
        section.querySelectorAll(".expand-card.expanded").forEach((c) => {
          c.classList.remove("expanded");
          c.querySelector(".expand-card-toggle")?.setAttribute("aria-expanded", "false");
        });

        if (!wasExpanded) {
          card.classList.add("expanded");
          toggle.setAttribute("aria-expanded", "true");
        }
        return;
      }

      const timelineBtn = e.target.closest(".timeline-toggle");
      if (timelineBtn) {
        const entry = timelineBtn.closest(".timeline-entry");
        if (!entry) return;
        const wasOpen = entry.classList.contains("open");
        mainEl.querySelectorAll(".timeline-entry").forEach((el) => {
          el.classList.remove("open");
          el.querySelector(".timeline-toggle")?.setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          entry.classList.add("open");
          timelineBtn.setAttribute("aria-expanded", "true");
        }
      }
    });
  }

  function render() {
    renderNav();
    renderPage();
  }

  async function init() {
    try {
      const res = await fetch("data/resume_dashboard.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.data = await res.json();
      renderHeader(state.data.profile);
      render();
      bindInteractions();
      window.addEventListener("resize", setHeaderHeight);
    } catch (err) {
      mainEl.innerHTML = `<p class="error">Failed to load resume data. Run <code>python3 scripts/build_resume_data.py</code> and serve via HTTP.<br>${escapeHtml(err.message)}</p>`;
    }
  }

  init();
})();
