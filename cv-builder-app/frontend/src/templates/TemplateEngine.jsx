import React from 'react';
import {
  PhotoBlock, HeaderBlock, ContactBlock, SummaryBlock,
  ExperienceBlock, EducationBlock, SkillsBlock, LanguagesBlock, CoursesBlock
} from './TemplateBlocks';

const dict = {
  pt: {
    profile: "Perfil Profissional", experience: "Experiência", education: "Formação Académica",
    courses: "Certificações", skills: "Competências", languages: "Idiomas",
    contact: "Contactos", details: "Dados Pessoais", references: "Referências"
  },
  en: {
    profile: "Professional Profile", experience: "Experience", education: "Education",
    courses: "Certifications", skills: "Skills", languages: "Languages",
    contact: "Contact", details: "Personal Details", references: "References"
  }
};

const CustomGeometry = ({ type, color }) => {
  if (type === 'curve-header') {
    return (
      <svg viewBox="0 0 1440 220" style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 0 }}>
        <path fill={color} fillOpacity="1" d="M0,0L1440,0L1440,160C1100,280,340,280,0,160V0Z"></path>
      </svg>
    )
  }
  if (type === 'diagonal-header') {
    return (
      <svg viewBox="0 0 1440 220" style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 0 }} preserveAspectRatio="none">
        <path fill={color} fillOpacity="1" d="M0,0L1440,0L1440,100L0,220Z"></path>
      </svg>
    )
  }
  return null;
}

const TemplateEngine = ({ templateConfig, data, lang = 'pt' }) => {
  const { name, title, summary, photo } = data;
  const experiences = data.experiences || [];
  const educations = data.educations || [];
  const courses = data.courses || [];
  const languages = data.languages || [];
  const skills = data.skills || [];

  const t = dict[lang] || dict.pt;
  const th = templateConfig.theme || {};
  const colors = th.colors || {};
  const variants = templateConfig.variants || {};
  const geometry = templateConfig.layout?.geometry || null;

  const np = (name || '').trim().split(' ');
  const initials = ((np[0] || '').charAt(0) + (np[np.length - 1] || '').charAt(0)).toUpperCase() || 'CV';

  const renderBlock = (blockName, key, context) => {
    const isSidebar = context === 'sidebar';
    const mainColor = isSidebar ? (colors.sidebarTitle || '#fff') : colors.primary;
    const textColor = isSidebar ? (colors.sidebarText || '#e2e8f0') : colors.textMain;

    switch (blockName) {
      case 'photo':
        return <PhotoBlock key={key} photo={photo} initials={initials} variants={variants} context={context} colors={colors} />;
      case 'page-title':
        return (
          <div key={key} style={{ width: '100%', textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: variants.headings === 'mozambican' ? '16px' : '24px', fontWeight: 'bold', textDecoration: variants.headings === 'mozambican' ? 'none' : 'underline', color: variants.headings === 'mozambican' ? '#000' : colors.primary, margin: 0, textTransform: 'uppercase' }}>Curriculum Vitae</h1>
          </div>
        );
      case 'header':
        return <HeaderBlock key={key} name={name} title={title} context={context} geometry={geometry} colors={colors} />;
      case 'contact':
        return <ContactBlock key={key} data={data} t={t} variants={variants} context={context} colors={colors} mainColor={mainColor} textColor={textColor} />;
      case 'summary':
        return <SummaryBlock key={key} summary={summary} t={t} mainColor={mainColor} textColor={textColor} variants={variants} />;
      case 'experience':
        return <ExperienceBlock key={key} experiences={experiences} t={t} variants={variants} mainColor={mainColor} textColor={textColor} colors={colors} />;
      case 'education':
        return <EducationBlock key={key} educations={educations} t={t} variants={variants} mainColor={mainColor} textColor={textColor} colors={colors} />;
      case 'skills':
        return <SkillsBlock key={key} skills={skills} t={t} variants={variants} mainColor={mainColor} textColor={textColor} context={context} />;
      case 'languages':
        return <LanguagesBlock key={key} languages={languages} t={t} variants={variants} mainColor={mainColor} textColor={textColor} />;
      case 'courses':
        return <CoursesBlock key={key} courses={courses} t={t} variants={variants} mainColor={mainColor} textColor={textColor} />;
      default:
        return null;
    }
  };

  const layoutType = templateConfig.layout?.type || 'two-column';
  const sidebarWidth = templateConfig.layout?.sidebarWidth || '35%';
  const hasSidebar = layoutType.includes('sidebar') || layoutType === 'two-column';
  const hasTopbar = layoutType.includes('topbar');

  return (
    <div className="cv-template-engine-root" style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      minHeight: '1123px', // A4
      fontFamily: templateConfig.theme?.font || "'Inter', sans-serif",
      backgroundColor: colors.background || '#fff',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'visible'
    }}>

      {geometry && <CustomGeometry type={geometry} color={hasSidebar && !hasTopbar ? (colors.sidebarBg || colors.primary) : colors.primary} />}

      <div className="cv-template-engine-body" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {hasTopbar && (
          <header className="cv-topbar" style={{
            width: '100%',
            backgroundColor: colors.topbarBg === 'transparent' ? 'transparent' : (colors.topbarBg || colors.primary),
            padding: geometry ? '50px 50px 30px' : '40px 50px',
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            boxSizing: 'border-box'
          }}>
            {templateConfig.structure.topbar?.map((block, i) => renderBlock(block, `topbar-${i}`, 'topbar'))}
          </header>
        )}

        <div className="cv-template-engine-layout" style={{ display: 'flex', flex: 1, flexDirection: templateConfig.layout?.sidebarPosition === 'right' ? 'row-reverse' : 'row' }}>
          {hasSidebar && (
            <aside className="cv-sidebar" style={{
              width: sidebarWidth,
              backgroundColor: colors.sidebarBg === 'transparent' ? 'transparent' : (colors.sidebarBg || '#f1f5f9'),
              padding: hasTopbar ? '30px 40px' : '50px 40px',
              boxSizing: 'border-box',
              alignSelf: 'stretch',
              minHeight: '100%',
              borderRight: templateConfig.layout?.sidebarPosition === 'left' && colors.sidebarBg === 'transparent' ? `1px solid rgba(0,0,0,0.1)` : 'none',
              borderLeft: templateConfig.layout?.sidebarPosition === 'right' && colors.sidebarBg === 'transparent' ? `1px solid rgba(0,0,0,0.1)` : 'none'
            }}>
              {templateConfig.structure.sidebar?.map((block, i) => renderBlock(block, `sidebar-${i}`, 'sidebar'))}
            </aside>
          )}

          <main className="cv-main" style={{
            flex: 1,
            backgroundColor: 'transparent',
            padding: hasTopbar ? '30px 50px' : (geometry && hasSidebar ? '180px 50px 50px' : '50px 50px'),
            boxSizing: 'border-box'
          }}>
            {templateConfig.structure.main?.map((block, i) => renderBlock(block, `main-${i}`, 'main'))}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TemplateEngine;
