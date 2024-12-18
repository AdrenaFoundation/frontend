import Image from 'next/image';
import Link from 'next/link';
import { Id, toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import { AdrenaTransactionError, getTxExplorer } from '@/utils';

import clockIcon from '../../../../public/images/Icons/clock.png';
import closeIcon from '../../../../public/images/Icons/cross.svg';
import doneIcon from '../../../../public/images/Icons/done.png';
import errorIcon from '../../../../public/images/Icons/error-full.png';
import loaderIcon from '../../../../public/images/Icons/loader.svg';

export enum NotificationStepState {
  waiting,
  inProgress,
  succeeded,
  error,
}

export type NotificationStep = {
  title: string;
  state: NotificationStepState;
};

export type NotificationSteps = NotificationStep[];

export default class MultiStepNotification {
  // Reference the notification once in toast system
  protected toastId: Id | null = null;

  protected activeStepIndex = 0;

  protected error: string | AdrenaTransactionError | null = null;

  protected txHash: string | null = null;

  protected constructor(
    protected title: string,
    protected steps: NotificationSteps,
  ) { }

  public static new({
    title,
    steps,
  }: {
    title: string;
    steps: Omit<NotificationStep, 'state'>[];
  }): MultiStepNotification {
    return new MultiStepNotification(
      title,
      steps.map((step, i) => ({
        ...step,
        state:
          i === 0
            ? NotificationStepState.inProgress
            : NotificationStepState.waiting,
      })),
    );
  }

  // Contains the steps for a regular transaction
  public static newForRegularTransaction(title: string): MultiStepNotification {
    return MultiStepNotification.new({
      title,
      steps: [
        {
          title: 'Prepare transaction',
        },
        {
          title: 'Sign transaction',
        },
        {
          title: 'Execute transaction',
        },
        {
          title: 'Confirm transaction',
        },
      ],
    });
  }

  public setTxHash(txHash: string): void {
    this.txHash = txHash;
  }

  public currentStepSucceeded(): void {
    // Nothing to do there
    if (this.activeStepIndex >= this.steps.length || this.toastId === null)
      return;

    this.steps[this.activeStepIndex].state = NotificationStepState.succeeded;

    this.activeStepIndex += 1;

    if (this.activeStepIndex == this.steps.length) {
      toast.update(this.toastId, {
        render: this.getContent(),
      });

      this.close(5_000);
      return;
    }

    this.steps[this.activeStepIndex].state = NotificationStepState.inProgress;

    toast.update(this.toastId, {
      render: this.getContent(),
    });
  }

  public currentStepErrored(error: string | AdrenaTransactionError): void {
    // Nothing to do there
    if (this.activeStepIndex >= this.steps.length || this.toastId === null)
      return;

    this.steps[this.activeStepIndex].state = NotificationStepState.error;

    this.error = error;

    this.activeStepIndex += 1;

    this.close(10_000);

    toast.update(this.toastId, {
      render: this.getContent(),
    });
  }

  public close(msDelay: number) {
    if (this.toastId === null) return;

    if (msDelay <= 0) {
      toast.dismiss(this.toastId);
      return;
    }

    setTimeout(() => {
      if (this.toastId === null) return;

      toast.dismiss(this.toastId);
    }, msDelay);
  }

  protected getContent() {
    const errorMessage = (() => {
      if (this.error === null) return '';

      if (this.error instanceof AdrenaTransactionError) {
        return this.error.errorString;
      }

      return this.error;
    })();

    return (
      <div className="w-[20em] h-[10em] bg-[#162a3d] shadow-2xl z-[9999] border">
        <div className="flex flex-col pt-2 pb-2 pl-4 h-full w-full">
          <div className="flex w-full">
            <h2>{this.title ?? 'Title'}</h2>

            <Image
              className="opacity-20 hover:opacity-40 cursor-pointer ml-auto mr-4"
              onClick={() => {
                this.close(0);
              }}
              src={closeIcon}
              alt="close icon"
              width={20}
              height={20}
            />
          </div>

          <div className="h-[1px] mt-2 w-full bg-bcolor" />

          <div className="flex grow w-full items-center justify-center">
            <div className="h-[6em] min-w-[9em] shrink w-full flex flex-col justify-center gap-2">
              {this.steps.map((step, index) => (
                <div key={index} className="w-full items-center flex h-4">
                  <div className="w-[1.6em] mr-1 flex items-center justify-center">
                    {step.state === NotificationStepState.waiting ? (
                      <Image
                        className="opacity-40"
                        src={clockIcon}
                        alt="clock icon"
                        width={13}
                        height={13}
                      />
                    ) : null}

                    {step.state === NotificationStepState.inProgress ? (
                      <Image
                        src={loaderIcon}
                        alt="loader icon"
                        width={28}
                        height={28}
                      />
                    ) : null}

                    {step.state === NotificationStepState.error ? (
                      <Image
                        src={errorIcon}
                        alt="error icon"
                        width={14}
                        height={14}
                      />
                    ) : null}

                    {step.state === NotificationStepState.succeeded ? (
                      <Image
                        src={doneIcon}
                        alt="done icon"
                        width={15}
                        height={15}
                      />
                    ) : null}
                  </div>

                  <div className="w-auto text-sm font-regular opacity-70">
                    {step.title}
                  </div>
                </div>
              ))}
            </div>

            {this.error !== null ? (
              <>
                <div className="h-full w-[1px] bg-bcolor shrink-0 grow-0" />

                <div className="flex flex-col pl-2 pr-2 w-full">
                  <p
                    className={twMerge(
                      'flex items-center text-sm justify-center text-center w-full h-full pl-4 pr-4',
                      errorMessage.length >= 70 && 'text-xs',
                    )}
                  >
                    {errorMessage}
                  </p>

                  {this.error instanceof AdrenaTransactionError &&
                    this.error.txHash ? (
                    <Link
                      href={getTxExplorer(this.error.txHash)}
                      target="_blank"
                      className="underline mt-2 flex ml-auto mr-auto text-sm"
                    >
                      view transaction
                    </Link>
                  ) : null}
                </div>
              </>
            ) : this.txHash ? (
              <>
                <div className="h-full w-[1px] bg-bcolor shrink-0 grow-0" />

                <Link
                  href={getTxExplorer(this.txHash)}
                  target="_blank"
                  className="underline w-full items-center justify-center flex text-sm"
                >
                  view transaction
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  public fire(): MultiStepNotification {
    this.toastId = toast(this.getContent(), {
      position: 'bottom-left',
      autoClose: false, // Handle the closure manually
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      icon: false,
      closeButton: false,
      /* bodyStyle: {
        margin: 0,
        padding: 0,
      }, */
      style: {
        width: '20em',
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 0,
        marginTop: '0.5em',
        padding: 0,
      },
    });

    return this;
  }
}
