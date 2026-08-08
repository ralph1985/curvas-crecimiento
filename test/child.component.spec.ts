// biome-ignore-all lint/correctness/noUnusedFunctionParameters: test stubs
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
    out.should.have(1, '.modal-wide table');
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
});
