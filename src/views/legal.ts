import m from 'mithril';

export type LegalPageKey =
  | 'aviso-legal'
  | 'politica-privacidad'
  | 'politica-cookies';

type LegalSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
};

const pages: Record<
  LegalPageKey,
  {title: string; intro: string; sections: LegalSection[]}
> = {
  'aviso-legal': {
    title: 'Aviso legal',
    intro: 'Información sobre esta aplicación y sus condiciones de uso.',
    sections: [
      {
        title: 'Titularidad',
        paragraphs: [
          'Curvas de crecimiento es un proyecto personal publicado por Rafael García Prieto a través de conquense.dev.',
        ],
      },
      {
        title: 'Objeto y uso',
        paragraphs: [
          'La aplicación permite registrar medidas infantiles en el navegador y compararlas visualmente con referencias de crecimiento de la Organización Mundial de la Salud (OMS). Su uso es voluntario y gratuito.',
          'La información es orientativa y no sustituye la valoración, el diagnóstico ni el seguimiento de un profesional sanitario.',
        ],
      },
      {
        title: 'Referencias',
        paragraphs: [
          'Las curvas proceden de referencias de crecimiento infantil de la OMS. Consulta siempre a un profesional sanitario si tienes dudas sobre la evolución de un niño o una niña.',
        ],
      },
      {
        title: 'Responsabilidad',
        paragraphs: [
          'La aplicación se ofrece tal cual. No se garantiza que esté disponible de forma permanente ni que los datos guardados localmente sobrevivan a un borrado del almacenamiento del navegador, un cambio de dispositivo o una incidencia técnica.',
        ],
      },
      {
        title: 'Propiedad intelectual',
        paragraphs: [
          'El código, diseño y recursos propios de esta aplicación pertenecen a sus respectivos autores o se utilizan conforme a sus licencias. Las referencias de la OMS pertenecen a la OMS.',
        ],
      },
    ],
  },
  'politica-privacidad': {
    title: 'Política de privacidad',
    intro:
      'Aquí explicamos qué ocurre con los datos que introduces en Curvas de crecimiento.',
    sections: [
      {
        title: 'Qué datos puedes guardar',
        paragraphs: [
          'La aplicación permite guardar en este navegador nombres, fechas de nacimiento, sexo, peso, longitud, perímetro craneal y fechas de medición de niños y niñas. Esta información puede revelar datos sobre su crecimiento y salud.',
        ],
      },
      {
        title: 'Dónde se guardan',
        paragraphs: [
          'Los datos se guardan únicamente en el almacenamiento local (localStorage) del navegador y del dispositivo que estés usando. El código de esta aplicación no los envía a Rafael García Prieto, no crea cuentas y no los guarda en una base de datos propia.',
          'Si borras los datos de navegación o el almacenamiento del sitio, esos registros se perderán. Antes de hacerlo, utiliza Exportar para guardar una copia JSON y poder recuperarla después con Importar.',
        ],
      },
      {
        title: 'Acceso y control',
        paragraphs: [
          'Rafael García Prieto no puede consultar los datos que tu navegador guarda para esta aplicación. Puedes verlos, modificarlos, exportarlos, importarlos o eliminarlos desde la propia aplicación y desde la configuración de tu navegador.',
        ],
      },
      {
        title: 'Servicios de terceros',
        paragraphs: [
          'La aplicación no utiliza cuentas, publicidad, analítica propia ni cookies para identificarte. Los enlaces a la OMS y a GitHub llevan a servicios externos, que aplican sus propias políticas cuando los visitas. El alojamiento puede tratar datos técnicos necesarios para servir la web y protegerla.',
        ],
      },
      {
        title: 'Seguridad',
        paragraphs: [
          'El almacenamiento local depende de la seguridad de tu navegador, dispositivo y cuenta. No equivale a una copia de seguridad ni a un almacenamiento cifrado gestionado por el titular. Exporta tus datos si necesitas conservarlos o cambiar de dispositivo.',
        ],
      },
      {
        title: 'Aviso importante',
        paragraphs: [
          'Los datos de salud están especialmente protegidos por la normativa de protección de datos. Este texto describe el funcionamiento técnico actual de la aplicación y debe revisarse jurídicamente antes de presentarlo como asesoramiento legal o como una determinación definitiva de las obligaciones aplicables.',
        ],
      },
    ],
  },
  'politica-cookies': {
    title: 'Política de cookies',
    intro:
      'Esta aplicación no utiliza cookies para identificarte ni para realizar publicidad.',
    sections: [
      {
        title: 'Cookies',
        paragraphs: [
          'Curvas de crecimiento no instala cookies propias ni de terceros para analizar tu navegación, crear perfiles o mostrar publicidad.',
        ],
      },
      {
        title: 'Almacenamiento local',
        paragraphs: [
          'La aplicación usa localStorage, una función del navegador distinta de las cookies, para guardar tus registros y recordar que ya has visto la información inicial sobre privacidad.',
          'Este almacenamiento pertenece a tu navegador. Si lo eliminas, los datos guardados se perderán. Puedes exportarlos antes a un archivo JSON y recuperarlos después mediante Importar.',
        ],
      },
      {
        title: 'Enlaces externos',
        paragraphs: [
          'Los enlaces a otros sitios, como la OMS o GitHub, se abren en sus propios entornos. Esos servicios pueden utilizar cookies o tecnologías similares conforme a sus propias políticas.',
        ],
      },
    ],
  },
};

const LegalPageComponent: m.Component<{page: LegalPageKey}> = {
  view: ({attrs: {page}}) => {
    const content = pages[page];
    return m(
      '.legal-page.app-panel',
      m('a.legal-back', {href: '#'}, '← Volver a la aplicación'),
      m('p.eyebrow', 'Información legal'),
      m('h1', content.title),
      m('p.panel-intro', content.intro),
      m(
        '.legal-sections',
        content.sections.map(section =>
          m(
            'section.legal-section',
            m('h2', section.title),
            section.paragraphs?.map(paragraph => m('p', paragraph)),
            section.list
              ? m(
                  'ul',
                  section.list.map(item => m('li', item)),
                )
              : null,
          ),
        ),
      ),
      m('a.legal-back', {href: '#'}, '← Volver a la aplicación'),
    );
  },
};

export default LegalPageComponent;
