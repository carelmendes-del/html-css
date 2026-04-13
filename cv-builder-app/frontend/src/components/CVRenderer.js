export const renderCV = (templateId, data, lang = 'pt') => {
  const { name, title, email, phone, location, linkedin, summary, photo, dataNascimento, nacionalidade, estadoCivil, bi } = data;
  const experiences = data.experiences || [];
  const educations = data.educations || [];
  const courses = data.courses || [];
  const languages = data.languages || [];
  const skills = data.skills || [];

  const esc = (s) => String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  // Format ISO date YYYY-MM-DD -> DD/MM/YYYY (or return as-is if already formatted)
  const formatDate = (d) => { if (!d) return ''; const m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? `${m[3]}/${m[2]}/${m[1]}` : d; };
  const np = (name||'').trim().split(' ');
  const last = np.length > 1 ? np.pop() : np[0] || '';
  const first = np.length > 1 ? np.join(' ') : '';
  const initials = ((first||'').charAt(0)+(last||'').charAt(0)).toUpperCase() || 'CV';

  const dict = {
    pt: {
      profile: "Perfil Profissional", experience: "Experiência Profissional", education: "Formação Académica", 
      courses: "Certificações", skills: "Competências", languages: "Idiomas", 
      contact: "Contacto", details: "Dados Pessoais", references: "Referências"
    },
    en: {
      profile: "Professional Profile", experience: "Work Experience", education: "Education", 
      courses: "Certifications", skills: "Skills", languages: "Languages", 
      contact: "Contact", details: "Personal Details", references: "References"
    }
  };
  const t = dict[lang] || dict.pt;

  // HELPER BLOCKS FOR TEMPLATES 1-5
  const expBlocks = experiences.map(e => `
    <div style="margin-bottom:12px">
      <div class="exp-title">${esc(e.role)||'Cargo'}</div>
      <div class="exp-sub">${esc(e.company)||''}</div>
      <div class="exp-date">${esc(e.period)||''}</div>
      ${e.desc ? `<div class="exp-desc">${esc(e.desc)}</div>` : ''}
    </div>`).join('');

  const eduBlocks = educations.map(e => `
    <div style="margin-bottom:10px">
      <div class="edu-title">${esc(e.degree)||'Curso'}</div>
      <div class="edu-sub">${esc(e.institution)||''}</div>
      <div class="edu-date">${esc(e.period)||''}</div>
    </div>`).join('');

  const courseBlocks = courses.map(c => `
    <div class="course-item">${esc(c.name)||'Curso'}<div class="course-inst">${esc(c.year)||''} ${c.institution ? '· '+esc(c.institution) : ''}</div></div>`).join('');

  const langBlocks = languages.map(l => `
    <div class="lang-row"><span>${esc(l.name)}</span><span class="lang-level">${esc(l.level)}</span></div>`).join('');

  const avatarHtml = photo ? `<div class="cv-avatar-box"><img src="${esc(photo)}" alt="Foto"/></div>` : '';

  let innerHTML = '';

  if (templateId === 1) {
    const bars=skills.map(s=>`<div class="skill-bullet-t1">${esc(s)}</div>`).join('');
    innerHTML = `<div class="cv-header">
      <div class="header-inner">
        ${avatarHtml}
        <div class="header-txt">
          <div class="cv-name">${esc(name)||'Seu Nome'}</div><div class="cv-title">${esc(title)||'Cargo Profissional'}</div>
          <div class="cv-contact">${[esc(email),esc(phone),esc(location),esc(linkedin),dataNascimento?formatDate(dataNascimento):''].filter(Boolean).map(i=>`<span>${i}</span>`).join('')}</div>
        </div>
      </div>
    </div>
    <div class="cv-body"><div class="cv-main">
      ${summary?`<div class="section-block"><div class="cv-section-title">${t.profile}</div><div class="summary-text">${esc(summary)}</div></div>`:''}
      ${experiences.length?`<div class="section-block"><div class="cv-section-title">${t.experience}</div>${expBlocks}</div>`:''}
      ${educations.length?`<div class="section-block"><div class="cv-section-title">${t.education}</div>${eduBlocks}</div>`:''}
      ${courses.length?`<div class="section-block"><div class="cv-section-title">${t.courses}</div>${courseBlocks}</div>`:''}
    </div><div class="cv-side">
      ${bars?`<div class="section-block"><div class="cv-section-title">${t.skills}</div>${bars}</div>`:''}
      ${languages.length?`<div class="section-block"><div class="cv-section-title">${t.languages}</div>${langBlocks}</div>`:''}
    </div></div>`;
  }
  else if (templateId === 2) {
    const pills=skills.map(s=>`<span class="skill-pill">${s}</span>`).join('');
    innerHTML = `<div class="cv-header"><div class="cv-header-accent"></div>
      <div class="cv-header-content header-inner">
        ${avatarHtml}
        <div class="header-txt">
          <div class="cv-name">${esc(name)||'Seu Nome'}</div><div class="cv-title">${esc(title)||'Cargo'}</div>
          <div class="cv-contact">${[esc(email),esc(phone),esc(location),dataNascimento?formatDate(dataNascimento):''].filter(Boolean).map(i=>`<span>${i}</span>`).join('')}</div>
        </div>
      </div>
    </div>
    <div class="cv-body"><div class="cv-main">
      ${summary?`<div class="section-block"><div class="cv-section-title">${t.profile}</div><div class="summary-text">${esc(summary)}</div></div>`:''}
      ${experiences.length?`<div class="section-block"><div class="cv-section-title">${t.experience}</div>${expBlocks}</div>`:''}
      ${educations.length?`<div class="section-block"><div class="cv-section-title">${t.education}</div>${eduBlocks}</div>`:''}
      ${courses.length?`<div class="section-block"><div class="cv-section-title">${t.courses}</div>${courseBlocks}</div>`:''}
    </div><div class="cv-side">
      ${pills?`<div class="side-section" style="margin-bottom:16px"><div class="cv-side-label">${t.skills}</div><div style="display:flex;flex-wrap:wrap;gap:5px">${pills}</div></div>`:''}
      ${languages.length?`<div class="side-section" style="margin-bottom:16px"><div class="cv-side-label">${t.languages}</div>${langBlocks}</div>`:''}
    </div></div>`;
  }
  else if (templateId === 3) {
    const contacts=[esc(email),esc(phone),esc(location),esc(linkedin),dataNascimento?formatDate(dataNascimento):''].filter(Boolean);
    const sideSkills=skills.map(s=>`<span class="t3-badge">${esc(s)}</span>`).join('');
    const sideLangs=languages.map(l=>`<div class="t3-lang"><span>${esc(l.name)}</span><span class="t3-lang-lv">${esc(l.level)}</span></div>`).join('');
    
    const expMain=experiences.map(e=>`
      <div class="t3-item">
        <div class="t3-item-header">
          <div class="t3-item-rolebase">
            <h3 class="t3-role">${esc(e.role)||'Cargo'}</h3>
            <span class="t3-company">${esc(e.company)}</span>
          </div>
          <div class="t3-date">${esc(e.period)}</div>
        </div>
        ${e.desc ? `<p class="t3-desc">${esc(e.desc)}</p>` : ''}
      </div>`).join('');

    const eduMain=educations.map(e=>`
      <div class="t3-item">
        <div class="t3-item-header">
          <div class="t3-item-rolebase">
            <h3 class="t3-role">${esc(e.degree)||'Curso'}</h3>
            <span class="t3-company">${esc(e.institution)}</span>
          </div>
          <div class="t3-date">${esc(e.period)}</div>
        </div>
      </div>`).join('');

    const courseMain=courses.map(c=>`
      <div class="t3-item">
        <div class="t3-item-header">
          <div class="t3-item-rolebase">
            <h3 class="t3-role">${esc(c.name)||'Certificação'}</h3>
            <span class="t3-company">${esc(c.institution)}</span>
          </div>
          <div class="t3-date">${esc(c.year)}</div>
        </div>
      </div>`).join('');

    innerHTML = `<div class="t3-wrap">
      <aside class="t3-sidebar">
        <div class="t3-brand">
          <h1 class="t3-name">${esc(name)||'Seu Nome'}</h1>
          <h2 class="t3-title">${esc(title)||'Cargo Profissional'}</h2>
        </div>
        
        <div class="t3-contact-box">
          <h3 class="t3-side-title">${t.contact}</h3>
          ${contacts.map(c=>`<div class="t3-contact-item">${c}</div>`).join('')}
        </div>
        
        ${sideSkills?`
        <div class="t3-side-sec">
          <h3 class="t3-side-title">${t.skills}</h3>
          <div class="t3-badges">${sideSkills}</div>
        </div>`:''}
        
        ${sideLangs?`
        <div class="t3-side-sec">
          <h3 class="t3-side-title">${t.languages}</h3>
          <div class="t3-langs">${sideLangs}</div>
        </div>`:''}
      </aside>

      <main class="t3-main">
        ${summary?`
        <section class="t3-section">
          <h2 class="t3-sec-title">${t.profile}</h2>
          <p class="t3-summary">${esc(summary)}</p>
        </section>`:''}
        
        ${expMain?`
        <section class="t3-section">
          <h2 class="t3-sec-title">${t.experience}</h2>
          <div class="t3-timeline">${expMain}</div>
        </section>`:''}
        
        ${eduMain?`
        <section class="t3-section">
          <h2 class="t3-sec-title">${t.education}</h2>
          <div class="t3-timeline">${eduMain}</div>
        </section>`:''}
        
        ${courseMain?`
        <section class="t3-section">
          <h2 class="t3-sec-title">${t.courses}</h2>
          <div class="t3-timeline">${courseMain}</div>
        </section>`:''}
      </main>
    </div>`;
  }
  else if (templateId === 4) {
    const bullets=skills.map(s=>`<div class="skill-bullet">${s}</div>`).join('');
    innerHTML = `<div class="cv-header">
      <div class="header-inner">
        ${avatarHtml}
        <div class="header-txt">
          <div class="cv-name">${esc(name)||'Seu Nome'}</div><div class="cv-title">${esc(title)||'Cargo'}</div>
          <div class="cv-contact">${[esc(email),esc(phone),esc(location),dataNascimento?formatDate(dataNascimento):''].filter(Boolean).map(i=>`<span>${i}</span>`).join('')}</div>
        </div>
      </div>
    </div>
    <div class="cv-body"><div class="cv-main">
      ${summary?`<div class="section-block"><div class="cv-section-title">${t.profile}</div><div class="summary-text">${esc(summary)}</div></div>`:''}
      ${experiences.length?`<div class="section-block"><div class="cv-section-title">${t.experience}</div>${expBlocks}</div>`:''}
      ${educations.length?`<div class="section-block"><div class="cv-section-title">${t.education}</div>${eduBlocks}</div>`:''}
      ${courses.length?`<div class="section-block"><div class="cv-section-title">${t.courses}</div>${courseBlocks}</div>`:''}
    </div><div class="cv-side">
      ${bullets?`<div class="side-section"><div class="cv-section-title">${t.skills}</div>${bullets}</div>`:''}
      ${languages.length?`<div class="side-section"><div class="cv-section-title">${t.languages}</div>${langBlocks}</div>`:''}
    </div></div>`;
  }
  else if (templateId === 5) {
    const chips=skills.map(s=>`<span class="skill-chip">${s}</span>`).join('');
    const t5Exp=experiences.map(e=>`<div class="t5-timeline-item"><div class="t5-dot"></div><div class="exp-title">${esc(e.role)||'Cargo'}</div><div class="exp-sub">${esc(e.company)||''}</div><div class="exp-date">${esc(e.period)||''}</div>${e.desc ? `<div class="exp-desc">${esc(e.desc)}</div>` : ''}</div>`).join('');
    const t5Edu=educations.map(e=>`<div class="t5-timeline-item"><div class="t5-dot"></div><div class="edu-title">${esc(e.degree)||'Curso'}</div><div class="edu-sub">${esc(e.institution)||''}</div><div class="edu-date">${esc(e.period)||''}</div></div>`).join('');
    const t5Course=courses.map(c=>`<div class="course-item"><div class="t5-dot-c"></div>${esc(c.name)||'Curso'}<div class="course-inst">${esc(c.year)||''} ${c.institution ? '· '+esc(c.institution) : ''}</div></div>`).join('');
    
    const contacts=[esc(email),esc(phone),esc(location),dataNascimento?formatDate(dataNascimento):''].filter(Boolean);
    // Show full name: if only one word, show it in t5-last; if multiple words, first in t5-first & last in t5-last
    const t5NameHtml = first
      ? `<span class="t5-first">${esc(first)}</span> <span class="t5-last">${esc(last)}</span>`
      : `<span class="t5-last">${esc(last)||'Seu Nome'}</span>`;
    innerHTML = `<div class="cv-header">
      <div class="header-inner">
        ${avatarHtml}
        <div class="header-txt">
          <div class="cv-name">${t5NameHtml}</div><div class="cv-title">${esc(title)||'Cargo'}</div>
        </div>
      </div>
      <div class="cv-contact-vert">${contacts.map(c=>`<div class="cv-contact-item">${c}</div>`).join('')}</div>
    </div><div class="cv-accent-bar"></div>
    <div class="cv-body"><div class="cv-main">
      ${summary?`<div class="section-block"><div class="cv-section-title"><div class="cv-sec-icon"></div>${t.profile}</div><div class="summary-text">${esc(summary)}</div></div>`:''}
      ${experiences.length?`<div class="section-block"><div class="cv-section-title"><div class="cv-sec-icon"></div>${t.experience}</div><div class="t5-track">${t5Exp}</div></div>`:''}
      ${educations.length?`<div class="section-block"><div class="cv-section-title"><div class="cv-sec-icon"></div>${t.education}</div><div class="t5-track">${t5Edu}</div></div>`:''}
      ${courses.length?`<div class="section-block"><div class="cv-section-title"><div class="cv-sec-icon"></div>${t.courses}</div><div class="t5-track">${t5Course}</div></div>`:''}
    </div><div class="cv-side">
      ${chips?`<div class="section-block"><div class="cv-section-title"><div class="cv-sec-icon"></div>${t.skills}</div>${chips}</div>`:''}
      ${languages.length?`<div class="section-block"><div class="cv-section-title"><div class="cv-sec-icon"></div>${t.languages}</div>${langBlocks}</div>`:''}
    </div></div>`;
  }
  else if (templateId === 6) {
    const avatarInner = photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;">` : initials;
    const skillBars=skills.map(s=>`<div class="t6-skill-name" style="margin-bottom:8px; border-bottom:1px dashed rgba(168,162,158,0.4); padding-bottom:6px;">${esc(s)}</div>`).join('');
    const langSide=languages.map(l=>`<div class="t6-lang-row"><span>${esc(l.name)}</span><span class="t6-lang-level">${esc(l.level)}</span></div>`).join('');
    const expMain=experiences.map(e=>`<div class="t6-exp-grid"><div class="t6-exp-date">${esc(e.period).replace('—','<br>')}</div><div class="t6-exp-body"><div class="t6-exp-role">${esc(e.role)||'Cargo'}</div><div class="t6-exp-co">${esc(e.company)}</div>${e.desc?`<div class="t6-exp-desc">${esc(e.desc)}</div>`:''}</div></div>`).join('');
    const eduMain=educations.map(e=>`<div class="t6-edu-grid"><div class="t6-edu-date">${esc(e.period).replace('—','<br>')}</div><div class="t6-edu-body"><div class="t6-edu-deg">${esc(e.degree)||'Curso'}</div><div class="t6-edu-sch">${esc(e.institution)}</div></div></div>`).join('');
    const courseMain=courses.map(c=>`<div class="t6-edu-grid"><div class="t6-edu-date">${esc(c.year)}</div><div class="t6-edu-body"><div class="t6-edu-deg">${esc(c.name)||'Curso'}</div><div class="t6-edu-sch">${esc(c.institution)}</div></div></div>`).join('');
    innerHTML = `<div class="cv-wrap">
      <aside class="t6-side">
        <div class="t6-avatar" style="overflow:hidden;">${avatarInner}</div>
        <div class="t6-side-sec"><div class="t6-side-label">${t.contact}</div><div class="t6-side-rule"></div>
          ${[esc(email),esc(phone),esc(location),esc(linkedin),dataNascimento?formatDate(dataNascimento):''].filter(Boolean).map(c=>`<div class="t6-contact-line">${c}</div>`).join('')}
        </div>
        ${langSide?`<div class="t6-side-sec"><div class="t6-side-label">${t.languages}</div><div class="t6-side-rule"></div>${langSide}</div>`:''}
        ${skillBars?`<div class="t6-side-sec"><div class="t6-side-label">${t.skills}</div><div class="t6-side-rule"></div>${skillBars}</div>`:''}
      </aside>
      <main class="t6-main">
        <div class="t6-name">${esc(first)?esc(first)+' ':''}<strong>${esc(last)}</strong></div>
        <div class="t6-job">${esc(title)||'Cargo Profissional'}</div>
        <div class="t6-rule"></div>
        ${summary?`<p class="t6-summary">${esc(summary)}</p>`:''}
        ${expMain?`<div class="t6-sec-gap"><div class="t6-sec-title">${t.experience}</div>${expMain}</div>`:''}
        ${eduMain?`<div class="t6-sec-gap"><div class="t6-sec-title">${t.education}</div>${eduMain}</div>`:''}
        ${courseMain?`<div class="t6-sec-gap"><div class="t6-sec-title">${t.courses}</div>${courseMain}</div>`:''}
      </main>
    </div>`;
  }
  else if (templateId === 7) {
    const avatarInner = photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;">` : initials;
    const contacts=[esc(email),esc(phone),esc(location),esc(linkedin),dataNascimento?formatDate(dataNascimento):''].filter(Boolean);
    const sideLangs=languages.map(l=>`<div class="t7-lang-row"><span>${esc(l.name)}</span><span class="t7-lang-lv">${esc(l.level)}</span></div>`).join('');
    // Convert sideSkills into progress bars
    const sideSkills=skills.map(s=>`<div class="t7-skill-bx"><div class="t7-skill-name">${esc(s)}</div><div class="t7-skill-bar"><div class="t7-skill-fill"></div></div></div>`).join('');
    const expMain=experiences.map(e=>`<div class="t7-eduwrap"><div class="t7-edudot"></div><div><div class="t7-exp-role">${esc(e.role)||'Cargo'}</div><div class="t7-exp-co">${esc(e.company)}</div>${e.period?`<div class="t7-edu-date" style="margin-top:2px">${esc(e.period)}</div>`:''}${e.desc?`<div class="t7-exp-desc">${esc(e.desc)}</div>`:''}</div></div>`).join('');
    const eduMain=educations.map(e=>`<div class="t7-eduwrap"><div class="t7-edudot"></div><div><div class="t7-edu-deg">${esc(e.degree)||'Curso'}</div><div class="t7-edu-inst">${esc(e.institution)}</div><div class="t7-edu-date">${esc(e.period)}</div></div></div>`).join('');
    const courseMain=courses.map(c=>`<div class="t7-eduwrap"><div class="t7-edudot"></div><div><div class="t7-edu-deg">${esc(c.name)||'Curso'}</div><div class="t7-edu-inst">${esc(c.institution)}</div><div class="t7-edu-date">${esc(c.year)}</div></div></div>`).join('');
    innerHTML = `<div class="cv-wrap">
      <aside class="t7-side">
        <div class="t7-ava-wrap">
          <div class="t7-avatar" style="overflow:hidden;">${avatarInner}</div>
          <div class="t7-sname"><span class="t7-first">${esc(first)?esc(first):'Seu'}</span> <span class="t7-last">${esc(last)?esc(last):'Nome'}</span></div>
          <div class="t7-stitle">${esc(title)||'Cargo'}</div>
        </div>
        <div class="t7-side-body">
          <div class="t7-slabel">${t.contact}</div><div class="t7-srule"></div>
          ${contacts.map(c=>`<div class="t7-contact">${c}</div>`).join('')}
          ${sideLangs?`<div class="t7-slabel">${t.languages}</div><div class="t7-srule"></div>${sideLangs}`:''}
          ${sideSkills?`<div class="t7-slabel">${t.skills}</div><div class="t7-srule"></div><div style="margin-bottom:10px">${sideSkills}</div>`:''}
        </div>
      </aside>
      <div class="t7-main">
        <div class="t7-mhdr">
          <div class="t7-mname"><span class="t7-mfirst">${esc(first)?esc(first):''}</span> <span class="t7-mlast">${esc(last)?esc(last):''}</span></div>
          <div class="t7-mtitle">${esc(title)||'Cargo'}</div>
          <div class="t7-mcontacts">${contacts.map(c=>`<span class="t7-mci">• ${c}</span>`).join('')}</div>
        </div>
        <div class="t7-mbody">
          ${summary?`<div class="t7-secblock"><div class="t7-sectitle">${t.profile}</div><div class="t7-summary">${esc(summary)}</div></div>`:''}
          ${expMain?`<div class="t7-secblock"><div class="t7-sectitle">${t.experience}</div>${expMain}</div>`:''}
          ${eduMain?`<div class="t7-secblock"><div class="t7-sectitle">${t.education}</div>${eduMain}</div>`:''}
          ${courseMain?`<div class="t7-secblock"><div class="t7-sectitle">${t.courses}</div>${courseMain}</div>`:''}
        </div>
      </div>
    </div>`;
  }
  else if (templateId === 8) {
    // T8: MOZAMBICAN FORMAL MODEL
    innerHTML = `<div style="font-family:'Times New Roman',serif;color:#000;background:#fff;padding:40px;line-height:1.5;">
      <div style="text-align:center;margin-bottom:20px;border-bottom:2px solid #000;padding-bottom:10px;">
        <h1 style="font-size:24px;text-transform:uppercase;letter-spacing:1px;margin:0;">CURRICULUM VITAE</h1>
      </div>
      
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
        <div>
          <h2 style="font-size:16px;margin:0 0 10px 0;text-transform:uppercase;border-bottom:1px solid #ccc;"></h2>
          <table style="font-size:12px;width:100%;">
            <tr><td style="width:120px;font-weight:bold;">Nome:</td><td>${esc(name)}</td></tr>
            ${dataNascimento?`<tr><td style="font-weight:bold;">Data de Nasc.:</td><td>${formatDate(dataNascimento)}</td></tr>`:''}
            ${nacionalidade?`<tr><td style="font-weight:bold;">Nacionalidade:</td><td>${esc(nacionalidade)}</td></tr>`:''}
            ${estadoCivil?`<tr><td style="font-weight:bold;">Estado Civil:</td><td>${esc(estadoCivil)}</td></tr>`:''}
            ${bi?`<tr><td style="font-weight:bold;">B.I. / NUIT:</td><td>${esc(bi)}</td></tr>`:''}
            <tr><td style="font-weight:bold;">Endereço:</td><td>${esc(location)}</td></tr>
            <tr><td style="font-weight:bold;">Contacto:</td><td>${esc(phone)}</td></tr>
            <tr><td style="font-weight:bold;">E-mail:</td><td>${esc(email)}</td></tr>
          </table>
        </div>
        ${photo ? `<div style="border:1px solid #000;padding:2px;"><img src="${photo}" style="width:100px;height:120px;object-fit:cover;"></div>` : ''}
      </div>

      ${summary ? `
      <div style="margin-bottom:20px;">
        <h2 style="font-size:14px;margin:0 0 10px 0;text-transform:uppercase;border-bottom:1px solid #ccc;">Perfil Profissional</h2>
        <p style="font-size:12px;text-align:justify;">${esc(summary)}</p>
      </div>` : ''}

      ${educations.length ? `
      <div style="margin-bottom:20px;">
        <h2 style="font-size:14px;margin:0 0 10px 0;text-transform:uppercase;border-bottom:1px solid #ccc;">Habilitações Literárias</h2>
        <ul style="font-size:12px;padding-left:20px;margin:0;">
          ${educations.map(e=> `<li style="margin-bottom:6px;"><strong>${esc(e.period)}:</strong> ${esc(e.degree)} - ${esc(e.institution)}</li>`).join('')}
        </ul>
      </div>` : ''}

      ${experiences.length ? `
      <div style="margin-bottom:20px;">
        <h2 style="font-size:14px;margin:0 0 10px 0;text-transform:uppercase;border-bottom:1px solid #ccc;">Experiência Profissional</h2>
        <ul style="font-size:12px;padding-left:20px;margin:0;">
          ${experiences.map(e=> `<li style="margin-bottom:8px;"><strong>${esc(e.period)}:</strong> ${esc(e.company)}<br/><em>Cargo:</em> ${esc(e.role)}<br/>${esc(e.desc)}</li>`).join('')}
        </ul>
      </div>` : ''}

      ${courses.length ? `
      <div style="margin-bottom:20px;">
        <h2 style="font-size:14px;margin:0 0 10px 0;text-transform:uppercase;border-bottom:1px solid #ccc;">Certificações</h2>
        <ul style="font-size:12px;padding-left:20px;margin:0;">
          ${courses.map(c=> `<li><strong>${esc(c.year)}:</strong> ${esc(c.name)} - ${esc(c.institution)}</li>`).join('')}
        </ul>
      </div>` : ''}

      <div style="display:flex;gap:40px;margin-bottom:20px;">
        ${languages.length ? `
        <div style="flex:1;">
          <h2 style="font-size:14px;margin:0 0 10px 0;text-transform:uppercase;border-bottom:1px solid #ccc;">Idiomas</h2>
          <ul style="font-size:12px;padding-left:20px;margin:0;">
            ${languages.map(l=> `<li>${esc(l.name)} - ${esc(l.level)}</li>`).join('')}
          </ul>
        </div>` : ''}
        ${skills.length ? `
        <div style="flex:1;">
          <h2 style="font-size:14px;margin:0 0 10px 0;text-transform:uppercase;border-bottom:1px solid #ccc;">Qualificações Informáticas / Outras</h2>
          <span style="font-size:12px;">${skills.join(', ')}</span>
        </div>` : ''}
      </div>

    </div>`;
  }
  else if (templateId === 9) {
    const avatarInner = photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;">` : initials;
    const contacts=[esc(email),esc(phone),esc(location),esc(linkedin),dataNascimento?formatDate(dataNascimento):''].filter(Boolean);
    const sideLangs=languages.map(l=>`<div class="t9-lang-row"><span>${esc(l.name)}</span><span class="t9-lang-lv">${esc(l.level)}</span></div>`).join('');
    // Convert to bars
    const sideSkills=skills.map(s=>`<div class="t9-skill-bx"><div class="t9-skill-name">${esc(s)}</div><div class="t9-skill-bar"><div class="t9-skill-fill"></div></div></div>`).join('');
    const expMain=experiences.map(e=>`<div class="t9-item-wrap"><div class="t9-item-date">${esc(e.period).replace('—','<br>')}</div><div class="t9-dot"></div><div class="t9-item-body"><div class="t9-role">${esc(e.role)||'Cargo'}</div><div class="t9-co">${esc(e.company)}</div>${e.desc?`<div class="t9-desc">${esc(e.desc)}</div>`:''}</div></div>`).join('');
    const eduMain=educations.map(e=>`<div class="t9-item-wrap"><div class="t9-item-date">${esc(e.period).replace('—','<br>')}</div><div class="t9-dot"></div><div class="t9-item-body"><div class="t9-role">${esc(e.degree)||'Curso'}</div><div class="t9-co">${esc(e.institution)}</div></div></div>`).join('');
    const courseMain=courses.map(c=>`<div class="t9-item-wrap"><div class="t9-item-date">${esc(c.year)}</div><div class="t9-dot"></div><div class="t9-item-body"><div class="t9-role">${esc(c.name)||'Curso'}</div><div class="t9-co">${esc(c.institution)}</div></div></div>`).join('');
    innerHTML = `<div class="t9-wrap">
      <aside class="t9-side">
        <div class="t9-avatar-wrap"><div class="t9-avatar">${avatarInner}</div></div>
        <div class="t9-side-block"><div class="t9-s-title">${t.contact}</div>
          ${contacts.map(c=>`<div class="t9-contact-line">${c}</div>`).join('')}
        </div>
        ${sideSkills?`<div class="t9-side-block"><div class="t9-s-title">${t.skills}</div>${sideSkills}</div>`:''}
        ${sideLangs?`<div class="t9-side-block"><div class="t9-s-title">${t.languages}</div>${sideLangs}</div>`:''}
      </aside>
      <main class="t9-main">
        <div class="t9-name"><span class="t9-first">${esc(first)?esc(first):''}</span> <span class="t9-last">${esc(last)?esc(last):''}</span></div>
        <div class="t9-title">${esc(title)||'Cargo'}</div>
        ${summary?`<div class="t9-summary">${esc(summary)}</div>`:''}
        ${expMain?`<div class="t9-section"><div class="t9-sec-title"><div class="t9-sec-icon"></div>${t.experience}</div><div class="t9-track">${expMain}</div></div>`:''}
        ${eduMain?`<div class="t9-section"><div class="t9-sec-title"><div class="t9-sec-icon"></div>${t.education}</div><div class="t9-track">${eduMain}</div></div>`:''}
        ${courseMain?`<div class="t9-section"><div class="t9-sec-title"><div class="t9-sec-icon"></div>${t.courses}</div><div class="t9-track">${courseMain}</div></div>`:''}
      </main>
    </div>`;
  }
  else if (templateId === 10) {
    const avatarInner = photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;">` : initials;
    const contacts=[esc(email),esc(phone),esc(location),esc(linkedin),dataNascimento?formatDate(dataNascimento):''].filter(Boolean);
    const sideLangs=languages.map(l=>`<div class="t10-lang-row"><span>${esc(l.name)}</span><span class="t10-lang-lv">${esc(l.level)}</span></div>`).join('');
    const sideSkills=skills.map(s=>`<div class="t10-skill-bx"><div class="t10-skill-name">${esc(s)}</div><div class="t10-skill-bar"><div class="t10-skill-fill"></div></div></div>`).join('');
    const expMain=experiences.map(e=>`<div class="t10-card"><div class="t10-dot"></div><div class="t10-c-head"><div class="t10-role">${esc(e.role)||'Cargo'}</div><div class="t10-date">${esc(e.period)}</div></div><div class="t10-co">${esc(e.company)}</div>${e.desc?`<div class="t10-desc">${esc(e.desc)}</div>`:''}</div>`).join('');
    const eduMain=educations.map(e=>`<div class="t10-card"><div class="t10-dot"></div><div class="t10-c-head"><div class="t10-role">${esc(e.degree)||'Curso'}</div><div class="t10-date">${esc(e.period)}</div></div><div class="t10-co">${esc(e.institution)}</div></div>`).join('');
    const courseMain=courses.map(c=>`<div class="t10-card"><div class="t10-dot"></div><div class="t10-c-head"><div class="t10-role">${esc(c.name)||'Curso'}</div><div class="t10-date">${esc(c.year)}</div></div><div class="t10-co">${esc(c.institution)}</div></div>`).join('');
    innerHTML = `<div class="t10-wrap">
      <div class="t10-header">
        <div class="t10-h-left">
          <div class="t10-name"><span class="t10-first">${esc(first)?esc(first):''}</span> <span class="t10-last">${esc(last)?esc(last):''}</span></div>
          <div class="t10-title">${esc(title)||'Cargo'}</div>
        </div>
        <div class="t10-avatar">${avatarInner}</div>
      </div>
      <div class="t10-top-contacts">
        ${contacts.map(c=>`<span>${c}</span>`).join('')}
      </div>
      <div class="t10-body">
        <div class="t10-main">
          ${summary?`<div class="t10-sec"><div class="t10-sec-title"><div class="t10-sec-icon"></div>${t.profile}</div><div class="t10-summary">${esc(summary)}</div></div>`:''}
          ${expMain?`<div class="t10-sec"><div class="t10-sec-title"><div class="t10-sec-icon"></div>${t.experience}</div><div class="t10-track">${expMain}</div></div>`:''}
          ${eduMain?`<div class="t10-sec"><div class="t10-sec-title"><div class="t10-sec-icon"></div>${t.education}</div><div class="t10-track">${eduMain}</div></div>`:''}
          ${courseMain?`<div class="t10-sec"><div class="t10-sec-title"><div class="t10-sec-icon"></div>${t.courses}</div><div class="t10-track">${courseMain}</div></div>`:''}
        </div>
        <div class="t10-side">
          ${sideSkills?`<div class="t10-sec"><div class="t10-sec-title"><div class="t10-sec-icon"></div>${t.skills}</div><div class="t10-skills-grid">${sideSkills}</div></div>`:''}
          ${sideLangs?`<div class="t10-sec"><div class="t10-sec-title"><div class="t10-sec-icon"></div>${t.languages}</div>${sideLangs}</div>`:''}
        </div>
      </div>
    </div>`;
  }

  else if (templateId === 11) {
    const avatarInner = photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;">` : initials;
    const contacts=[esc(email),esc(phone),esc(location),esc(linkedin),dataNascimento?formatDate(dataNascimento):''].filter(Boolean);
    const sideSkills=skills.map((s,i)=>`<div class="t11-skill-bx t11-skill-accent-${(i%4)+1}"><div class="t11-skill-name">${esc(s)}</div><div class="t11-skill-bar"><div class="t11-skill-fill"></div></div></div>`).join('');
    const sideLangs=languages.map(l=>`<div class="t11-lang"><span>${esc(l.name)}</span><span class="t11-lang-lv">${esc(l.level)}</span></div>`).join('');
    const expMain=experiences.map(e=>`<div class="t11-item"><div class="t11-dot"></div><div class="t11-item-title">${esc(e.role)||'Cargo'}</div><div class="t11-item-sub">${esc(e.company)} · ${esc(e.period)}</div>${e.desc?`<div class="t11-item-desc">${esc(e.desc)}</div>`:''}</div>`).join('');
    const eduMain=educations.map(e=>`<div class="t11-item"><div class="t11-dot"></div><div class="t11-item-title">${esc(e.degree)||'Curso'}</div><div class="t11-item-sub">${esc(e.institution)} · ${esc(e.period)}</div></div>`).join('');
    // Show full name correctly
    const t11NameHtml = first
      ? `<span class="t11-first">${esc(first)}</span> <span class="t11-last">${esc(last)}</span>`
      : `<span class="t11-last">${esc(last)||'Nome'}</span>`;
    
    innerHTML = `<div class="t11-wrap">
      <aside class="t11-side">
        <div class="t11-avatar-wrap"><div class="t11-avatar">${avatarInner}</div></div>
        <div class="t11-name">${t11NameHtml}</div>
        <div class="t11-title">${esc(title)||'Cargo'}</div>
        <div class="t11-divider"></div>
        <div class="t11-section"><div class="t11-sec-title">${t.contact}</div>${contacts.map(c=>`<div class="t11-contact">${c}</div>`).join('')}</div>
        ${sideSkills?`<div class="t11-section"><div class="t11-sec-title">${t.skills}</div><div class="t11-skills-col">${sideSkills}</div></div>`:''}
        ${sideLangs?`<div class="t11-section"><div class="t11-sec-title">${t.languages}</div>${sideLangs}</div>`:''}
      </aside>
      <main class="t11-main">
        ${summary?`<div class="t11-section"><div class="t11-sec-title-main"><div class="t11-sec-icon"></div>${t.profile}</div><div class="t11-summary">${esc(summary)}</div></div>`:''}
        ${expMain?`<div class="t11-section"><div class="t11-sec-title-main"><div class="t11-sec-icon"></div>${t.experience}</div><div class="t11-track">${expMain}</div></div>`:''}
        ${eduMain?`<div class="t11-section"><div class="t11-sec-title-main"><div class="t11-sec-icon"></div>${t.education}</div><div class="t11-track">${eduMain}</div></div>`:''}
      </main>
    </div>`;
  }
  else if (templateId === 12) {
    // T12 is always in English (professional European format)
    const t12 = { profile: 'Professional Summary', experience: 'Work Experience', education: 'Education', courses: 'Certifications', skills: 'Core Skills', languages: 'Languages', details: 'Personal Details' };
    const sideSkills=skills.map(s=>`<div class="t12-skill-bx"><div class="t12-skill-name">${esc(s)}</div><div class="t12-skill-bar"><div class="t12-skill-fill"></div></div></div>`).join('');
    const sideLangs=languages.map(l=>`<div class="t12-lang-row"><span class="t12-lang-name">${esc(l.name)}</span><span class="t12-lang-lv">${esc(l.level)}</span></div>`).join('');
    const courseMain=courses.map(c=>`<div class="t12-item"><div class="t12-dot"></div><div class="t12-date">${esc(c.year)}</div><div class="t12-content"><div class="t12-role">${esc(c.name)||'Course'}</div><div class="t12-co">${esc(c.institution)}</div></div></div>`).join('');
    const expMain=experiences.map(e=>`<div class="t12-item"><div class="t12-dot"></div><div class="t12-date">${esc(e.period)}</div><div class="t12-content"><div class="t12-role">${esc(e.role)||'Role'}</div><div class="t12-co">${esc(e.company)}</div>${e.desc?`<div class="t12-desc">${esc(e.desc)}</div>`:''}</div></div>`).join('');
    const eduMain=educations.map(e=>`<div class="t12-item"><div class="t12-dot"></div><div class="t12-date">${esc(e.period)}</div><div class="t12-content"><div class="t12-role">${esc(e.degree)||'Degree'}</div><div class="t12-co">${esc(e.institution)}</div></div></div>`).join('');
    // Show full name correctly
    const t12NameHtml = first
      ? `<span class="t12-first">${esc(first)}</span> <span class="t12-last">${esc(last)}</span>`
      : `<span class="t12-last">${esc(last)||'Full Name'}</span>`;
    
    innerHTML = `<div class="t12-wrap">
      <div class="t12-header">
        <div class="t12-header-left">
          <div class="t12-name">${t12NameHtml}</div>
          <div class="t12-job-title">${esc(title)||'Professional Title'}</div>
        </div>
        <div class="t12-sdetails">
          <div class="t12-sec-title"><span class="t12-sec-accent"></span>${t12.details.toUpperCase()}</div>
          <table class="t12-table">
            ${location?`<tr><td class="t12-td-label">Address</td><td>${esc(location)}</td></tr>`:''}
            ${phone?`<tr><td class="t12-td-label">Phone</td><td>${esc(phone)}</td></tr>`:''}
            ${email?`<tr><td class="t12-td-label">Email</td><td>${esc(email)}</td></tr>`:''}
            ${dataNascimento?`<tr><td class="t12-td-label">Date of Birth</td><td>${formatDate(dataNascimento)}</td></tr>`:''}
            ${linkedin?`<tr><td class="t12-td-label">LinkedIn</td><td>${esc(linkedin)}</td></tr>`:''}
          </table>
        </div>
      </div>
      <div class="t12-body">
        ${summary?`<div class="t12-section"><div class="t12-sec-title"><span class="t12-sec-accent"></span>${t12.profile.toUpperCase()}</div><div class="t12-text">${esc(summary)}</div></div>`:''}
        ${expMain?`<div class="t12-section"><div class="t12-sec-title"><span class="t12-sec-accent"></span>${t12.experience.toUpperCase()}</div><div class="t12-track">${expMain}</div></div>`:''}
        ${eduMain?`<div class="t12-section"><div class="t12-sec-title"><span class="t12-sec-accent"></span>${t12.education.toUpperCase()}</div><div class="t12-track">${eduMain}</div></div>`:''}
        ${courseMain?`<div class="t12-section"><div class="t12-sec-title"><span class="t12-sec-accent"></span>${t12.courses.toUpperCase()}</div><div class="t12-track">${courseMain}</div></div>`:''}
        <div class="t12-bottom-grid">
          ${sideSkills?`<div><div class="t12-sec-title"><span class="t12-sec-accent"></span>${t12.skills.toUpperCase()}</div><div class="t12-skills-col">${sideSkills}</div></div>`:''}
          ${sideLangs?`<div><div class="t12-sec-title"><span class="t12-sec-accent"></span>${t12.languages.toUpperCase()}</div>${sideLangs}</div>`:''}
        </div>
      </div>
    </div>`;
  }
  else if (templateId === 13) {
    // T13 is always in English
    const t13 = { profile: 'PROFILE', experience: 'WORK EXPERIENCE', education: 'EDUCATION', courses: 'CERTIFICATIONS', skills: 'SKILLS', languages: 'LANGUAGES', details: 'PERSONAL DETAILS' };
    const sideSkills=skills.map(s=>`<div class="t13-skill-bx"><div class="t13-skill-name">${esc(s)}</div><div class="t13-skill-bar"><div class="t13-skill-fill"></div></div></div>`).join('');
    const sideLangs=languages.map(l=>`<div class="t13-lang"><span>${esc(l.name)}</span><span class="t13-lang-lv">${esc(l.level)}</span></div>`).join('');
    const expMain=experiences.map(e=>`<div class="t13-item"><div class="t13-dot"></div><div class="t13-date">${esc(e.period).replace('—','-')}</div><div class="t13-content"><div class="t13-role">${esc(e.role)||'Role'}</div><div class="t13-co">${esc(e.company)}</div>${e.desc?`<div class="t13-desc">${esc(e.desc)}</div>`:''}</div></div>`).join('');
    const eduMain=educations.map(e=>`<div class="t13-item"><div class="t13-dot"></div><div class="t13-date">${esc(e.period).replace('—','-')}</div><div class="t13-content"><div class="t13-role">${esc(e.degree)||'Degree'}</div><div class="t13-co">${esc(e.institution)}</div></div></div>`).join('');
    const courseMain=courses.map(c=>`<div class="t13-item"><div class="t13-dot"></div><div class="t13-date">${esc(c.year)}</div><div class="t13-content"><div class="t13-role">${esc(c.name)||'Course'}</div><div class="t13-co">${esc(c.institution)}</div></div></div>`).join('');
    // Show full name correctly
    const t13NameHtml = first
      ? `<span class="t13-first">${esc(first)}</span> <span class="t13-last">${esc(last)}</span>`
      : `<span class="t13-last">${esc(last)||'Full Name'}</span>`;
    
    innerHTML = `<div class="t13-wrap">
      <div class="t13-header">
        <h1 class="t13-header-title">Curriculum Vitae</h1>
        <div class="t13-header-name">${esc(name)||'Full Name'}</div>
        <div class="t13-header-role">${esc(title)||'Professional Title'}</div>
      </div>
      <div class="t13-body">
        <aside class="t13-side">
          <div class="t13-section"><div class="t13-sec-title">${t13.details}</div>
            <div class="t13-name">${t13NameHtml}</div>
            ${location?`<div class="t13-address">${esc(location)}</div>`:''}
            <div class="t13-contact-box">${[esc(phone), esc(email), esc(linkedin)].filter(Boolean).map(c=>`<div class="t13-contact">${c}</div>`).join('')}</div>
            ${dataNascimento?`<div class="t13-contact">${formatDate(dataNascimento)}</div>`:''}
          </div>
          ${sideSkills?`<div class="t13-section"><div class="t13-sec-title">${t13.skills}</div><div class="t13-skills-col">${sideSkills}</div></div>`:''}
          ${sideLangs?`<div class="t13-section"><div class="t13-sec-title">${t13.languages}</div>${sideLangs}</div>`:''}
        </aside>
        <main class="t13-main">
          ${summary?`<div class="t13-section-m"><div class="t13-sec-title-m"><div class="t13-sec-icon"></div>${t13.profile}</div><div class="t13-summary">${esc(summary)}</div></div>`:''}
          ${expMain?`<div class="t13-section-m"><div class="t13-sec-title-m"><div class="t13-sec-icon"></div>${t13.experience}</div><div class="t13-track">${expMain}</div></div>`:''}
          ${eduMain?`<div class="t13-section-m"><div class="t13-sec-title-m"><div class="t13-sec-icon"></div>${t13.education}</div><div class="t13-track">${eduMain}</div></div>`:''}
          ${courseMain?`<div class="t13-section-m"><div class="t13-sec-title-m"><div class="t13-sec-icon"></div>${t13.courses}</div><div class="t13-track">${courseMain}</div></div>`:''}
        </main>
      </div>
    </div>`;
  }

  return `<div id="cv-output" class="template-box ${templateId !== 8 ? 't'+templateId : ''}">${innerHTML}</div>`;
};
