import React from 'react';

import {
  USERSNAP_PROJECT_API_EVENT_NAME,
  USERSNAP_PROJECT_API_KEY,
} from '../../constant';
import { useUsersnapApi } from '../../UsersnapContext';
import Button from '../common/Button/Button';

/**
 * There a few ways to show your widget with custom button.
 * The first thing you need to do is to make sure in the dashboard
 * configuration of your widget in the "Display" tab you have trigger "Auto Popup".
 * Then select an "API event" as an activation and type the name of this event.
 * Then you can use this event name to show your widget. Please note
 */
export default function CustomButton() {
  const usersnapApi = useUsersnapApi();

  /**
   * This method ignores all the display rules and opens the widget
   * no matter what
   */
  const handleOpenWidgetForce = () => {
    usersnapApi
      ?.show(USERSNAP_PROJECT_API_KEY)
      .then((widgetApi) => widgetApi.open({}));
  };

  return (
    <>
      <div>
        <Button
          title="Feedback"
          variant="secondary"
          onClick={handleOpenWidgetForce}
        ></Button>
      </div>
    </>
  );
}
