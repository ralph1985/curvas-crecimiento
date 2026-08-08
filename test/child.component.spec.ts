// biome-ignore-all lint/correctness/noUnusedFunctionParameters: test stubs

import m from 'mithril';
import mq from 'mithril-query';
import o from 'ospec';

import type {LocalDate} from '@js-joda/core';

import type {Child, IChildActions, Measurement, Sex} from '../src/models/state';
import ChildComponent from '../src/views/child';
import children from './mock';

const stubChildActions: IChildActions = {
  update: (
    name: string | null,
    dateOfBirth: LocalDate | undefined,
    sex: Sex | null,
  ): void => {
    throw new Error('Function not implemented.');
  },
  pickColour: (hex: string): void => {
    throw new Error('Function not implemented.');
  },
  addMeasurement: (measurement?: Measurement | undefined): void => {
    throw new Error('Function not implemented.');
  },
  removeMeasurement: (idx: number): void => {
    throw new Error('Function not implemented.');
  },
  remove: (): void => {
    throw new Error('Function not implemented.');
  },
};

o.spec('Child component', () => {
  o('renders child details', () => {
    const child: Child = children[0];

    const out = mq(ChildComponent, {
      state: child,
      actions: stubChildActions,
    });
    o(out.rootEl).notEquals(null);

    // Summary opens the editor without expanding the card below.
    out.should.have(1, '.child-summary');
    out.should.contain('Ava');
    out.should.not.have('[role="dialog"]');

    out.click('.child-summary');
    out.should.have(1, '[role="dialog"]');

    // DOB input
    out.should.have(
      1,
      'input[type="date"][id="child-0-dob"][value="2020-03-23"]',
    );
    // Name input
    out.should.have(1, 'input[type="text"][id="child-0-name"][value="Ava"]');
    // Sex inputs
    out.should.have(
      1,
      'input[type="radio"][name="child-0-sex"][value="female"]:checked',
    );
    out.should.have(1, 'input[type="radio"][name="child-0-sex"][value="male"]');

    out.click('.modal-close');
    out.should.not.have('[role="dialog"]');

    out.click('.child-action');
    out.should.have(1, '.modal-wide');
    out.should.have(1, '.modal-wide .measurement-history-list');
    out.click('.measurement-summary');
    out.should.have(2, '[role="dialog"]');
    out.should.have(1, '.modal-measurement-edit');
    out.click('.modal-measurement-edit .modal-close');
    out.should.have(1, '[role="dialog"]');
    out.click('.modal-close');
    out.should.not.have('[role="dialog"]');
  });

  o('colour picker is enabled and updates the colour', () => {
    const child: Child = children[0];
    let pickedColour: string | undefined;

    const out = mq(ChildComponent, {
      state: child,
      actions: {
        ...stubChildActions,
        pickColour: (hex: string) => {
          pickedColour = hex;
        },
      },
    });

    out.click('.child-summary');
    const colourInput = 'input[type="color"][id="child-0-color"]';
    out.should.have(1, colourInput);
    out.should.not.have(`${colourInput}[disabled]`);
    out.should.not.have(`${colourInput}[readonly]`);

    out.setValue(colourInput, '#abcdef');
    o(pickedColour).equals('#abcdef');
  });

  o('adds a partial measurement and rejects an empty one', () => {
    const child: Child = {
      ...children[0],
      measurements: [],
    };
    let addedMeasurement: Measurement | undefined;

    const out = mq(ChildComponent, {
      state: child,
      actions: {
        ...stubChildActions,
        addMeasurement: (measurement: Measurement | undefined) => {
          addedMeasurement = measurement;
        },
      },
    });

    out.click('.child-action');
    const root = out.rootEl as HTMLElement;
    const form = root.querySelector<HTMLFormElement>('.measurement-form');
    if (!form) {
      throw new Error('No se ha encontrado el formulario de mediciones');
    }

    const submitEvent = form.ownerDocument.createEvent('Event');
    submitEvent.initEvent('submit', true, true);
    form.dispatchEvent(submitEvent);
    m.redraw.sync();
    o(addedMeasurement).equals(undefined);

    out.setValue('#new-measurement-weight', '4.1');
    const secondSubmitEvent = form.ownerDocument.createEvent('Event');
    secondSubmitEvent.initEvent('submit', true, true);
    form.dispatchEvent(secondSubmitEvent);

    o(addedMeasurement?.weight).equals(4.1);
    o(addedMeasurement?.length).equals(undefined);
    o(addedMeasurement?.head).equals(undefined);
  });

  o('discards measurement edits when the nested modal is cancelled', () => {
    const originalMeasurement = children[0].measurements[0];
    const child: Child = {
      ...children[0],
      measurements: [{...originalMeasurement}],
    };
    const out = mq(ChildComponent, {
      state: child,
      actions: stubChildActions,
    });

    out.click('.child-action');
    out.click('.measurement-summary');
    out.setValue('#edit-measurement-weight', '9');
    out.click('.modal-measurement-edit .button-secondary');

    out.click('.measurement-summary');
    out.should.have(
      1,
      `#edit-measurement-weight[value="${originalMeasurement.weight}"]`,
    );
  });
});
