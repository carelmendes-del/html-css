export const renderCV = (templateId, data) => {
  const { name, title, email, phone, location, linkedin, summary, photo, nacionalidade, dataNascimento, estadoCivil, bi } = data;
  const experiences = data.experiences || [];
  const educations = data.educations || [];
  const courses = data.courses || [];
  const languages = data.languages || [];
  const skills = data.skills || [];

  const esc = (s) => String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const np = (name||'').trim().split(' ');
  const last = np.length > 1 ? np.pop() : '';
  const first = np.join(' ');
  const initials = ((first||'').charAt(0)+(last||'').charAt(0)).toUpperCase() || 'CV';

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
          <div class="cv-contact">${[esc(email),esc(phone),esc(location),esc(linkedin)].filter(Boolean).map(i=>`<span>${i}</span>`).join('')}</div>
        </div>
      </div>
    </div>
    <div class="cv-body"><div class="cv-main">
      ${summary?`<div class="section-block"><div class="cv-section-title">Perfil</div><div class="summary-text">${esc(summary)}</div></div>`:''}
      ${experiences.length?`<div class="section-block"><div class="cv-section-title">Experiência</div>${expBlocks}</div>`:''}
      ${educations.length?`<div class="section-block"><div class="cv-section-title">Formação</div>${eduBlocks}</div>`:''}
      ${courses.length?`<div class="section-block"><div class="cv-section-title">Cursos</div>${courseBlocks}</div>`:''}
    </div><div class="cv-side">
      ${bars?`<div class="section-block"><div class="cv-section-title">Competências</div>${bars}</div>`:''}
      ${languages.length?`<div class="section-block"><div class="cv-section-title">Idiomas</div>${langBlocks}</div>`:''}
    </div></div>`;
  }
  else if (templateId === 2) {
    const pills=skills.map(s=>`<span class="skill-pill">${s}</span>`).join('');
    innerHTML = `<div class="cv-header"><div class="cv-header-accent"></div>
      <div class="cv-header-content header-inner">
        ${avatarHtml}
        <div class="header-txt">
          <div class="cv-name">${esc(name)||'Seu Nome'}</div><div class="cv-title">${esc(title)||'Cargo'}</div>
          <div class="cv-contact">${[esc(email),esc(phone),esc(location)].filter(Boolean).map(i=>`<span>${i}</span>`).join('')}</div>
        </div>
      </div>
    </div>
    <div class="cv-body"><div class="cv-main">
      ${summary?`<div class="section-block"><div class="cv-section-title">Sobre Mim</div><div class="summary-text">${esc(summary)}</div></div>`:''}
      ${experiences.length?`<div class="section-block"><div class="cv-section-title">Experiência</div>${expBlocks}</div>`:''}
      ${educations.length?`<div class="section-block"><div class="cv-section-title">Formação</div>${eduBlocks}</div>`:''}
      ${courses.length?`<div class="section-block"><div class="cv-section-title">Cursos</div>${courseBlocks}</div>`:''}
    </div><div class="cv-side">
      ${pills?`<div class="side-section" style="margin-bottom:16px"><div class="cv-side-label">Competências</div><div style="display:flex;flex-wrap:wrap;gap:5px">${pills}</div></div>`:''}
      ${languages.length?`<div class="side-section" style="margin-bottom:16px"><div class="cv-side-label">Idiomas</div>${langBlocks}</div>`:''}
    </div></div>`;
  }
  else if (templateId === 3) {
    const contacts=[esc(email),esc(phone),esc(location),esc(linkedin)].filter(Boolean);
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
          <h3 class="t3-side-title">Contato</h3>
          ${contacts.map(c=>`<div class="t3-contact-item">${c}</div>`).join('')}
        </div>
        
        ${sideSkills?`
        <div class="t3-side-sec">
          <h3 class="t3-side-title">Habilidades Técnicas</h3>
          <div class="t3-badges">${sideSkills}</div>
        </div>`:''}
        
        ${sideLangs?`
        <div class="t3-side-sec">
          <h3 class="t3-side-title">Idiomas</h3>
          <div class="t3-langs">${sideLangs}</div>
        </div>`:''}
      </aside>

      <main class="t3-main">
        ${summary?`
        <section class="t3-section">
          <h2 class="t3-sec-title">Perfil Profissional</h2>
          <p class="t3-summary">${esc(summary)}</p>
        </section>`:''}
        
        ${expMain?`
        <section class="t3-section">
          <h2 class="t3-sec-title">Experiência Profissional</h2>
          <div class="t3-timeline">${expMain}</div>
        </section>`:''}
        
        ${eduMain?`
        <section class="t3-section">
          <h2 class="t3-sec-title">Formação Acadêmica</h2>
          <div class="t3-timeline">${eduMain}</div>
        </section>`:''}
        
        ${courseMain?`
        <section class="t3-section">
          <h2 class="t3-sec-title" style="display: flex; alignItems: center; gap: 0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="1.2rem" height="1.2rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#6C5CE7;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Certificações
          </h2>
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
          <div class="cv-contact">${[esc(email),esc(phone),esc(location)].filter(Boolean).map(i=>`<span>${i}</span>`).join('')}</div>
        </div>
      </div>
    </div>
    <div class="cv-body"><div class="cv-main">
      ${summary?`<div class="section-block"><div class="cv-section-title">Perfil</div><div class="summary-text">${esc(summary)}</div></div>`:''}
      ${experiences.length?`<div class="section-block"><div class="cv-section-title">Experiência</div>${expBlocks}</div>`:''}
      ${educations.length?`<div class="section-block"><div class="cv-section-title">Formação</div>${eduBlocks}</div>`:''}
      ${courses.length?`<div class="section-block"><div class="cv-section-title">Cursos</div>${courseBlocks}</div>`:''}
    </div><div class="cv-side">
      ${bullets?`<div class="side-section"><div class="cv-section-title">Competências</div>${bullets}</div>`:''}
      ${languages.length?`<div class="side-section"><div class="cv-section-title">Idiomas</div>${langBlocks}</div>`:''}
    </div></div>`;
  }
  else if (templateId === 5) {
    const chips=skills.map(s=>`<span class="skill-chip">${s}</span>`).join('');
    const contacts=[esc(email),esc(phone),esc(location)].filter(Boolean);
    innerHTML = `<div class="cv-header">
      <div class="header-inner">
        ${avatarHtml}
        <div class="header-txt">
          <div class="cv-name">${esc(name)||'Seu Nome'}</div><div class="cv-title">${esc(title)||'Cargo'}</div>
        </div>
      </div>
      <div class="cv-contact-vert">${contacts.map(c=>`<div class="cv-contact-item">${c}</div>`).join('')}</div>
    </div><div class="cv-accent-bar"></div>
    <div class="cv-body"><div class="cv-main">
      ${summary?`<div class="section-block"><div class="cv-section-title">Sobre</div><div class="summary-text">${esc(summary)}</div></div>`:''}
      ${experiences.length?`<div class="section-block"><div class="cv-section-title">Experiência</div>${expBlocks}</div>`:''}
      ${educations.length?`<div class="section-block"><div class="cv-section-title">Formação</div>${eduBlocks}</div>`:''}
      ${courses.length?`<div class="section-block"><div class="cv-section-title">Cursos</div>${courseBlocks}</div>`:''}
    </div><div class="cv-side">
      ${chips?`<div class="section-block"><div class="cv-section-title">Skills</div>${chips}</div>`:''}
      ${languages.length?`<div class="section-block"><div class="cv-section-title">Idiomas</div>${langBlocks}</div>`:''}
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
        <div class="t6-side-sec"><div class="t6-side-label">Contacto</div><div class="t6-side-rule"></div>
          ${[esc(email),esc(phone),esc(location),esc(linkedin)].filter(Boolean).map(c=>`<div class="t6-contact-line">${c}</div>`).join('')}
        </div>
        ${langSide?`<div class="t6-side-sec"><div class="t6-side-label">Idiomas</div><div class="t6-side-rule"></div>${langSide}</div>`:''}
        ${skillBars?`<div class="t6-side-sec"><div class="t6-side-label">Competências</div><div class="t6-side-rule"></div>${skillBars}</div>`:''}
      </aside>
      <main class="t6-main">
        <div class="t6-name">${esc(first)?esc(first)+' ':''}<strong>${esc(last)}</strong></div>
        <div class="t6-job">${esc(title)||'Cargo Profissional'}</div>
        <div class="t6-rule"></div>
        ${summary?`<p class="t6-summary">${esc(summary)}</p>`:''}
        ${expMain?`<div class="t6-sec-gap"><div class="t6-sec-title">Experiência Profissional</div>${expMain}</div>`:''}
        ${eduMain?`<div class="t6-sec-gap"><div class="t6-sec-title">Formação Académica</div>${eduMain}</div>`:''}
        ${courseMain?`<div class="t6-sec-gap"><div class="t6-sec-title">Certificações</div>${courseMain}</div>`:''}
      </main>
    </div>`;
  }
  else if (templateId === 7) {
    const avatarInner = photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;">` : initials;
    const contacts=[esc(email),esc(phone),esc(location),esc(linkedin)].filter(Boolean);
    const sideLangs=languages.map(l=>`<div class="t7-lang-row"><span>${esc(l.name)}</span><span class="t7-lang-lv">${esc(l.level)}</span></div>`).join('');
    const sideSkills=skills.map(s=>`<span class="t7-skill-tag">${esc(s)}</span>`).join('');
    const expMain=experiences.map(e=>`<div class="t7-eduwrap"><div class="t7-edudot"></div><div><div class="t7-exp-role">${esc(e.role)||'Cargo'}</div><div class="t7-exp-co">${esc(e.company)}</div>${e.period?`<div class="t7-edu-date" style="margin-top:2px">${esc(e.period)}</div>`:''}${e.desc?`<div class="t7-exp-desc">${esc(e.desc)}</div>`:''}</div></div>`).join('');
    const eduMain=educations.map(e=>`<div class="t7-eduwrap"><div class="t7-edudot"></div><div><div class="t7-edu-deg">${esc(e.degree)||'Curso'}</div><div class="t7-edu-inst">${esc(e.institution)}</div><div class="t7-edu-date">${esc(e.period)}</div></div></div>`).join('');
    const courseMain=courses.map(c=>`<div class="t7-eduwrap"><div class="t7-edudot"></div><div><div class="t7-edu-deg">${esc(c.name)||'Curso'}</div><div class="t7-edu-inst">${esc(c.institution)}</div><div class="t7-edu-date">${esc(c.year)}</div></div></div>`).join('');
    innerHTML = `<div class="cv-wrap">
      <aside class="t7-side">
        <div class="t7-ava-wrap">
          <div class="t7-avatar" style="overflow:hidden;">${avatarInner}</div>
          <div class="t7-sname">${esc(name)||'Seu Nome'}</div>
          <div class="t7-stitle">${esc(title)||'Cargo'}</div>
        </div>
        <div class="t7-side-body">
          <div class="t7-slabel">Contacto</div><div class="t7-srule"></div>
          ${contacts.map(c=>`<div class="t7-contact">${c}</div>`).join('')}
          ${sideLangs?`<div class="t7-slabel">Idiomas</div><div class="t7-srule"></div>${sideLangs}`:''}
          ${sideSkills?`<div class="t7-slabel">Competências</div><div class="t7-srule"></div><div style="margin-bottom:10px">${sideSkills}</div>`:''}
        </div>
      </aside>
      <div class="t7-main">
        <div class="t7-mhdr">
          <div class="t7-mname">${esc(name)||'Seu Nome'}</div>
          <div class="t7-mtitle">${esc(title)||'Cargo'}</div>
          <div class="t7-mcontacts">${contacts.map(c=>`<span class="t7-mci">• ${c}</span>`).join('')}</div>
        </div>
        <div class="t7-mbody">
          ${summary?`<div class="t7-secblock"><div class="t7-sectitle">Sobre Mim</div><div class="t7-summary">${esc(summary)}</div></div>`:''}
          ${expMain?`<div class="t7-secblock"><div class="t7-sectitle">Experiência Profissional</div>${expMain}</div>`:''}
          ${eduMain?`<div class="t7-secblock"><div class="t7-sectitle">Formação Académica</div>${eduMain}</div>`:''}
          ${courseMain?`<div class="t7-secblock"><div class="t7-sectitle">Cursos</div>${courseMain}</div>`:''}
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
          <h2 style="font-size:16px;margin:0 0 10px 0;text-transform:uppercase;border-bottom:1px solid #ccc;">Dados Pessoais</h2>
          <table style="font-size:12px;width:100%;">
            <tr><td style="width:120px;font-weight:bold;">Nome:</td><td>${esc(name)}</td></tr>
            ${dataNascimento?`<tr><td style="font-weight:bold;">Data de Nasc.:</td><td>${esc(dataNascimento)}</td></tr>`:''}
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
        <h2 style="font-size:14px;margin:0 0 10px 0;text-transform:uppercase;border-bottom:1px solid #ccc;">Cursos e Certificações</h2>
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
    const contacts=[esc(email),esc(phone),esc(location),esc(linkedin)].filter(Boolean);
    const sideLangs=languages.map(l=>`<div class="t9-lang-row"><span>${esc(l.name)}</span><span class="t9-lang-lv">${esc(l.level)}</span></div>`).join('');
    const sideSkills=skills.map(s=>`<div class="t9-skill-item">${esc(s)}</div>`).join('');
    const expMain=experiences.map(e=>`<div class="t9-item-wrap"><div class="t9-item-date">${esc(e.period).replace('—','<br>')}</div><div class="t9-item-body"><div class="t9-role">${esc(e.role)||'Cargo'}</div><div class="t9-co">${esc(e.company)}</div>${e.desc?`<div class="t9-desc">${esc(e.desc)}</div>`:''}</div></div>`).join('');
    const eduMain=educations.map(e=>`<div class="t9-item-wrap"><div class="t9-item-date">${esc(e.period).replace('—','<br>')}</div><div class="t9-item-body"><div class="t9-role">${esc(e.degree)||'Curso'}</div><div class="t9-co">${esc(e.institution)}</div></div></div>`).join('');
    const courseMain=courses.map(c=>`<div class="t9-item-wrap"><div class="t9-item-date">${esc(c.year)}</div><div class="t9-item-body"><div class="t9-role">${esc(c.name)||'Curso'}</div><div class="t9-co">${esc(c.institution)}</div></div></div>`).join('');
    innerHTML = `<div class="t9-wrap">
      <aside class="t9-side">
        <div class="t9-avatar-wrap"><div class="t9-avatar">${avatarInner}</div></div>
        <div class="t9-side-block"><div class="t9-s-title">Contacto</div>
          ${contacts.map(c=>`<div class="t9-contact-line">${c}</div>`).join('')}
        </div>
        ${sideSkills?`<div class="t9-side-block"><div class="t9-s-title">Competências</div>${sideSkills}</div>`:''}
        ${sideLangs?`<div class="t9-side-block"><div class="t9-s-title">Idiomas</div>${sideLangs}</div>`:''}
      </aside>
      <main class="t9-main">
        <div class="t9-name">${esc(name)||'Seu Nome'}</div>
        <div class="t9-title">${esc(title)||'Cargo'}</div>
        ${summary?`<div class="t9-summary">${esc(summary)}</div>`:''}
        ${expMain?`<div class="t9-section"><div class="t9-sec-title">Experiência Profissional</div>${expMain}</div>`:''}
        ${eduMain?`<div class="t9-section"><div class="t9-sec-title">Formação Académica</div>${eduMain}</div>`:''}
        ${courseMain?`<div class="t9-section"><div class="t9-sec-title">Certificações</div>${courseMain}</div>`:''}
      </main>
    </div>`;
  }
  else if (templateId === 10) {
    const avatarInner = photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;">` : initials;
    const contacts=[esc(email),esc(phone),esc(location),esc(linkedin)].filter(Boolean);
    const sideLangs=languages.map(l=>`<div class="t10-lang-row"><span>${esc(l.name)}</span><span class="t10-lang-lv">${esc(l.level)}</span></div>`).join('');
    const sideSkills=skills.map(s=>`<div class="t10-skill-pill">${esc(s)}</div>`).join('');
    const expMain=experiences.map(e=>`<div class="t10-card"><div class="t10-c-head"><div class="t10-role">${esc(e.role)||'Cargo'}</div><div class="t10-date">${esc(e.period)}</div></div><div class="t10-co">${esc(e.company)}</div>${e.desc?`<div class="t10-desc">${esc(e.desc)}</div>`:''}</div>`).join('');
    const eduMain=educations.map(e=>`<div class="t10-card"><div class="t10-c-head"><div class="t10-role">${esc(e.degree)||'Curso'}</div><div class="t10-date">${esc(e.period)}</div></div><div class="t10-co">${esc(e.institution)}</div></div>`).join('');
    const courseMain=courses.map(c=>`<div class="t10-card"><div class="t10-c-head"><div class="t10-role">${esc(c.name)||'Curso'}</div><div class="t10-date">${esc(c.year)}</div></div><div class="t10-co">${esc(c.institution)}</div></div>`).join('');
    innerHTML = `<div class="t10-wrap">
      <div class="t10-header">
        <div class="t10-h-left">
          <div class="t10-name">${esc(name)||'Seu Nome'}</div>
          <div class="t10-title">${esc(title)||'Cargo'}</div>
        </div>
        <div class="t10-avatar">${avatarInner}</div>
      </div>
      <div class="t10-top-contacts">
        ${contacts.map(c=>`<span>${c}</span>`).join('')}
      </div>
      <div class="t10-body">
        <div class="t10-main">
          ${summary?`<div class="t10-sec"><div class="t10-sec-title">Resumo Profissional</div><div class="t10-summary">${esc(summary)}</div></div>`:''}
          ${expMain?`<div class="t10-sec"><div class="t10-sec-title">Experiência</div>${expMain}</div>`:''}
          ${eduMain?`<div class="t10-sec"><div class="t10-sec-title">Formação</div>${eduMain}</div>`:''}
          ${courseMain?`<div class="t10-sec"><div class="t10-sec-title">Cursos</div>${courseMain}</div>`:''}
        </div>
        <div class="t10-side">
          ${sideSkills?`<div class="t10-sec"><div class="t10-sec-title">Skills</div><div class="t10-skills-flex">${sideSkills}</div></div>`:''}
          ${sideLangs?`<div class="t10-sec"><div class="t10-sec-title">Idiomas</div>${sideLangs}</div>`:''}
        </div>
      </div>
    </div>`;
  }

  return `<div id="cv-output" class="template-box ${templateId !== 8 ? 't'+templateId : ''}">${innerHTML}</div>`;
};
