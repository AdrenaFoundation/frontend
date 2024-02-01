import { twMerge } from 'tailwind-merge';

import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';

function TermsAndConditionsModal({
  className,
  isOpen,
  agreeTrigger,
  declineTrigger,
}: {
  className?: string;
  isOpen: boolean;
  agreeTrigger: () => void;
  declineTrigger: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      title="Terms and conditions"
      close={() => {
        // nothing
      }}
      className={twMerge(
        className,
        'flex',
        'flex-col',
        'items-center',
        'p-4',
        'max-w-[30em]',
        'max-h-[40em]',
      )}
    >
      <div className="h-full max-h-full overflow-auto">
        Definitio: In his Terminis et Conditionibus, <b>Website</b> refert ad
        nomen tuum situs web. <b>User</b> refert ad individuum quod utitur hoc
        Website, sive consummator, sive negotiator. Usus Situs: Situs est liber
        ad usum omnium Usuariorum. Usuarii utuntur hoc Website ad suum
        periculum. Intellectus Dominium: Omnes notae commercii, logo, copyright,
        servicemarks, et aliud intellectus dominium quod apparet in Website sunt
        proprietates situs. Limitatio Responsabilitatis: Website non est
        responsabilis pro quolibet damno, directo vel indirecto, quod sequitur
        ex usu Website. Link ad Alios Situs: Hoc Website potest includere links
        ad alios websites qui non sunt in nostro dominio. Non sumus
        responsabiles pro contento aut politico privato illorum websites.
        Mutationes: Website potest mutare illos Terminus et Conditiones sine
        notitia. Usuarius debet legere illos Terminus et Conditiones regulariter
        ad manet in scientia de mutationes. Lege Regente: Termini et Conditiones
        reguntur et interpretantur secundum lege nomen tuum civitatis/patriae.
        Contactus: Si habes ullos quaestiones vel suggestiones circa nostros
        Terminus et Conditiones, te rogamus nos contacta via nomen tuum
        email@dominum.com
      </div>

      <div className="flex w-full justify-around pt-6 mt-6 border-t border-grey">
        {/* TODO: redirect to landing website */}

        <Button
          title="[D]ecline"
          size="lg"
          variant="outline"
          className="w-full"
          onClick={() => {
            declineTrigger();
          }}
        />

        <Button
          title="[A]gree"
          size="lg"
          className="w-full"
          onClick={() => {
            agreeTrigger();
          }}
        />
      </div>
    </Modal>
  );
}

export default TermsAndConditionsModal;
