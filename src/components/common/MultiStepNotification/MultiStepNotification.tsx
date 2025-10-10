import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Id, toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import { getLogs } from '@/logs';
import { AdrenaTransactionError, getTxExplorer } from '@/utils';

import discordLogo from '../../../../public/images/discord.png';
import arrowIcon from '../../../../public/images/Icons/arrow-sm-45.svg';
import clockIcon from '../../../../public/images/Icons/clock.png';
import closeIcon from '../../../../public/images/Icons/cross.svg';
import doneIcon from '../../../../public/images/Icons/done.png';
import errorIcon from '../../../../public/images/Icons/error-full.png';
import loaderIcon from '../../../../public/images/Icons/loader.svg';
import Button from '../Button/Button';
import CopyButton from '../CopyButton/CopyButton';

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

export type NotificationAction = {
  title: string;
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'secondary';
};

export default class MultiStepNotification {
  // Reference the notification once in toast system
  protected toastId: Id | null = null;

  protected activeStepIndex = 0;

  protected error: string | AdrenaTransactionError | null = null;

  protected report_code: string | null = null;

  protected isSendingErrorReport = false;

  protected txHash: string | null = null;

  protected errorActions: NotificationAction[] = [];

  protected constructor(
    protected title: string,
    protected steps: NotificationSteps,
    protected closingTimeSuccessInMs: number,
    protected closingTimeErrorInMs: number,
  ) {}

  public static new({
    title,
    steps,
    closingTimeSuccessInMs = 5_000,
    closingTimeErrorInMs = 30_000,
  }: {
    title: string;
    steps: Omit<NotificationStep, 'state'>[];
    closingTimeSuccessInMs?: number;
    closingTimeErrorInMs?: number;
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
      closingTimeSuccessInMs,
      closingTimeErrorInMs,
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

  public setErrorActions(actions: NotificationAction[]): void {
    this.errorActions = actions;
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

      this.close(this.closingTimeSuccessInMs);
      return;
    }

    this.steps[this.activeStepIndex].state = NotificationStepState.inProgress;

    toast.update(this.toastId, {
      render: this.getContent(),
    });
  }

  private async sendErrorReport(): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.adrena) return;
      const walletAddress = window.adrena.client.getWalletAddress();

      this.isSendingErrorReport = true;
      const error = this.error;

      if (error === null || this.toastId === null) return;

      const currentUrl =
        typeof window !== 'undefined' ? window.location.href : '';

      const timestamp = new Date().toISOString();

      const recentLogs = getLogs();

      const response = await fetch('/api/error_reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          error_message:
            error instanceof AdrenaTransactionError ? error.errorString : error,
          console_log: recentLogs,
          timestamp,
          txHash: error instanceof AdrenaTransactionError ? error.txHash : null,
          url: currentUrl,
          action: this.title || '',
          step: this.steps[this.activeStepIndex]?.title || '',
        }),
      });

      if (!response.ok) {
        console.error('Failed to send error report:', response.statusText);
      } else {
        // Get the report code from the API response
        const data = await response.json();
        console.log('Error report response:', data);
        this.report_code = data.report_code;
        console.log('Error report sent successfully:', data);
      }
    } catch (err) {
      console.error('Error sending error report:', err);
    } finally {
      this.isSendingErrorReport = false;

      if (this.toastId) {
        toast.update(this.toastId, {
          render: this.getContent(),
        });
      }
    }
  }

  public currentStepErrored(error: string | AdrenaTransactionError): void {
    // Nothing to do there
    if (this.activeStepIndex >= this.steps.length || this.toastId === null)
      return;

    this.steps[this.activeStepIndex].state = NotificationStepState.error;

    this.error = error;

    this.activeStepIndex += 1;

    this.close(this.closingTimeErrorInMs);

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

    // Wrapper to filter out toast-specific props that shouldn't be passed to DOM
    // eslint-disable-next-line react/display-name
    return () => (
      <motion.div
        animate={{
          height: this.report_code
            ? '10em'
            : this.error !== null
              ? 'auto'
              : this.steps.length === 5
                ? '12.873125em'
                : '11em',
        }}
        transition={{ duration: 0.2 }}
        className="w-[20em] bg-[#08141E] shadow-2xl z-[9999] border border-[#1A2938] rounded-md"
      >
        <div className="flex flex-col h-full w-full">
          <div className="flex w-full justify-between p-2 px-3">
            <h3 className="font-semibold capitalize">
              {this.title ?? 'Title'}
            </h3>

            <Image
              className="opacity-20 hover:opacity-40 cursor-pointer"
              onClick={() => {
                this.close(0);
              }}
              src={closeIcon}
              alt="close icon"
              width={20}
              height={20}
            />
          </div>

          <div className="h-[1px] w-full bg-[#1A2938]" />

          {this.report_code !== null ? (
            <div className="flex flex-col gap-3 p-2 px-3">
              <div>
                <p className="mb-1 text-sm font-semibold bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]">
                  Report code:{' '}
                  <span className="text-white font-mono">
                    {this.report_code}
                  </span>
                  <CopyButton
                    textToCopy={this.report_code!}
                    notificationTitle="Report code copied"
                    className="inline-block ml-2 opacity-50"
                  />
                </p>

                <p className="text-sm text-txtfade">
                  If you need help, please provide this code to the support
                  team.
                </p>
              </div>
              <Button
                title="Open Discord"
                className="w-full text-xs border border-[#1A2938]"
                leftIcon={discordLogo}
                onClick={() => {
                  window.open('https://discord.gg/adrena', '_blank');
                }}
                variant="outline"
              />
            </div>
          ) : (
            <div className="flex flex-col h-full w-full items-center justify-center p-2">
              {this.error === null ? (
                <div className="h-full min-w-[11em] w-full flex flex-col justify-center gap-1 max-h-full overflow-auto">
                  {this.steps.map((step, index) => (
                    <div
                      key={index}
                      className="w-full items-center flex min-h-4 h-auto"
                    >
                      <div className="w-[1.6em] h-[1.6em] mr-1 flex items-center justify-center">
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

                      <div
                        className={twMerge(
                          'flex flex-row items-center gap-2 w-auto text-sm text-nowrap max-w-full overflow-hidden transition duration-500',
                          step.state === NotificationStepState.inProgress &&
                            'bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]',
                          step.state === NotificationStepState.error &&
                            'text-redbright',
                          step.state === NotificationStepState.succeeded &&
                            'text-green',
                          step.state === NotificationStepState.waiting &&
                            'opacity-40',
                          step.title === 'Execute transaction' &&
                            this.txHash &&
                            'underline cursor-pointer group',
                        )}
                        onClick={() => {
                          if (
                            step.title === 'Execute transaction' &&
                            this.txHash
                          ) {
                            window.open(getTxExplorer(this.txHash), '_blank');
                          }
                        }}
                      >
                        {step.title}
                        {step.title === 'Execute transaction' && this.txHash ? (
                          <motion.div
                            initial={{ opacity: 0, x: -5, filter: 'blur(5px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.3 }}
                          >
                            <Image
                              src={arrowIcon}
                              alt="arrow icon"
                              className="opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                              width={7}
                              height={7}
                            />{' '}
                          </motion.div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {this.error !== null ? (
                <>
                  <div className="flex flex-col gap-3 justify-between w-full p-1">
                    <div className="flex flex-row gap-2 items-center">
                      <Image
                        src={errorIcon}
                        alt="error icon"
                        width={12}
                        height={12}
                      />

                      <p
                        className={twMerge(
                          'text-sm font-semibold text-redbright w-full h-full',
                          errorMessage.length >= 70 && 'text-xs',
                        )}
                      >
                        {errorMessage}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 items-center">
                      {this.errorActions.length > 0 ? (
                        this.errorActions.map((action, index) => (
                          <Button
                            key={index}
                            title={action.title}
                            className="w-full text-xs"
                            onClick={action.onClick}
                            variant={action.variant || 'outline'}
                          />
                        ))
                      ) : (
                        // Show default "Get help" button
                        <Button
                          title="Get help"
                          className="w-full text-xs border border-[#1A2938]"
                          onClick={() => this.sendErrorReport()}
                          disabled={this.isSendingErrorReport}
                          variant="outline"
                        />
                      )}

                      {this.error instanceof AdrenaTransactionError &&
                      this.error.txHash ? (
                        <Link
                          href={getTxExplorer(this.error.txHash)}
                          target="_blank"
                          className="flex flex-row underline text-sm opacity-50 hover:opacity-100 items-center gap-1 transition-opacity duration-300 w-full"
                        >
                          <p className="font-mono">View transaction</p>
                          <Image
                            src={arrowIcon}
                            alt="arrow icon"
                            width={7}
                            height={7}
                          />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </motion.div>
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
        borderRadius: '0.76em',
        backgroundColor: 'transparent',
      },
    });

    return this;
  }
}
