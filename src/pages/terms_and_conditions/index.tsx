import { twMerge } from 'tailwind-merge';

import { PageProps } from '@/types';

export default function TermsAndConditions({}: PageProps) {
  return (
    <div
      className={twMerge(
        'w-full',
        'h-full',
        'flex',
        'p-4',
        'bg-main',
        'justify-center',
      )}
    >
      <div
        className={twMerge(
          'w-full',
          'flex',
          'max-w-[1400px]',
          'flex-col',
          'grow',
        )}
      >
        <div className="text-2xl mt-6">Terms and conditions</div>

        <div className="text-sm mt-4">
          Definitio: In his Terminis et Conditionibus, <b>Website</b> refert ad
          nomen tuum situs web. <b>User</b> refert ad individuum quod utitur hoc
          Website, sive consummator, sive negotiator. Usus Situs: Situs est
          liber ad usum omnium Usuariorum. Usuarii utuntur hoc Website ad suum
          periculum. Intellectus Dominium: Omnes notae commercii, logo,
          copyright, servicemarks, et aliud intellectus dominium quod apparet in
          Website sunt proprietates situs. Limitatio Responsabilitatis: Website
          non est responsabilis pro quolibet damno, directo vel indirecto, quod
          sequitur ex usu Website. Link ad Alios Situs: Hoc Website potest
          includere links ad alios websites qui non sunt in nostro dominio. Non
          sumus responsabiles pro contento aut politico privato illorum
          websites. Mutationes: Website potest mutare illos Terminus et
          Conditiones sine notitia. Usuarius debet legere illos Terminus et
          Conditiones regulariter ad manet in scientia de mutationes. Lege
          Regente: Termini et Conditiones reguntur et interpretantur secundum
          lege nomen tuum civitatis/patriae. Contactus: Si habes ullos
          quaestiones vel suggestiones circa nostros Terminus et Conditiones, te
          rogamus nos contacta via nomen tuum email@dominum.com
        </div>
      </div>
    </div>
  );
}
