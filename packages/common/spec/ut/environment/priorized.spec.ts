import 'jasmine';
import { PriorizedConfigurationProperties, MissingConfigurationProperty } from '../../../src';
import { mock, instance, when, anyString, anything } from 'ts-mockito';
import { ConfigurationProperties } from '@zetapush/core';

class MockConfigurationProperties implements ConfigurationProperties {
  has(key: string): boolean {
    return false;
  }

  get<T>(key: string): T;
  get<T>(key: string, defaultValue: T): T;
  get(key: string, defaultValue?: any): any {
    return null;
  }

  getOrThrow<T, E extends Error>(key: string, error?: E): T {
    return null;
  }
}

describe(`priorized properties`, () => {
  beforeEach(async () => {
    this.highPriority = mock(MockConfigurationProperties);
    this.middlePriority = mock(MockConfigurationProperties);
    this.lowPriority = mock(MockConfigurationProperties);
    this.props = new PriorizedConfigurationProperties(
      instance(this.highPriority),
      instance(this.middlePriority),
      instance(this.lowPriority)
    );
  });

  describe(`.has()`, () => {
    describe(`on key that matches all priorities`, () => {
      beforeEach(() => {
        when(this.highPriority.has('a')).thenReturn(true);
        when(this.middlePriority.has('a')).thenReturn(true);
        when(this.lowPriority.has('a')).thenReturn(true);
      });

      it(`returns true`, async () => {
        const value = this.props.has('a');
        expect(value).toEqual(true);
      });
    });

    describe(`on key that matches middle and low priorities`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(true);
        when(this.lowPriority.has('matched')).thenReturn(true);
      });

      it(`returns true`, async () => {
        const value = this.props.has('matched');
        expect(value).toEqual(true);
      });
    });

    describe(`on key that matches low priority`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(false);
        when(this.lowPriority.has('matched')).thenReturn(true);
      });

      it(`returns true`, async () => {
        const value = this.props.has('matched');
        expect(value).toEqual(true);
      });
    });

    describe(`on key that matches none`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(false);
        when(this.lowPriority.has('matched')).thenReturn(false);
      });

      it(`returns false`, async () => {
        const value = this.props.has('matched');
        expect(value).toEqual(false);
      });
    });
  });

  describe(`.get()`, () => {
    describe(`on key that matches all priorities`, () => {
      beforeEach(() => {
        when(this.highPriority.has('a')).thenReturn(true);
        when(this.highPriority.get('a')).thenReturn('value from high priority');
        when(this.middlePriority.has('a')).thenReturn(true);
        when(this.middlePriority.get('a')).thenReturn('value from middle priority');
        when(this.lowPriority.has('a')).thenReturn(true);
        when(this.lowPriority.get('a')).thenReturn('value from low priority');
      });

      it(`returns the value of the highest`, async () => {
        const value = this.props.get('a');
        expect(value).toEqual('value from high priority');
      });
    });

    describe(`on key that matches middle and low priorities`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(true);
        when(this.middlePriority.get('matched')).thenReturn('value from middle priority');
        when(this.lowPriority.has('matched')).thenReturn(true);
        when(this.lowPriority.get('matched')).thenReturn('value from low priority');
      });

      it(`returns the value of the middle`, async () => {
        const value = this.props.get('matched');
        expect(value).toEqual('value from middle priority');
      });
    });

    describe(`on key that matches low priority`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(false);
        when(this.lowPriority.has('matched')).thenReturn(true);
        when(this.lowPriority.get('matched')).thenReturn('value from low priority');
      });

      it(`returns the value of the low`, async () => {
        const value = this.props.get('matched');
        expect(value).toEqual('value from low priority');
      });
    });

    describe(`on key that matches none`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(false);
        when(this.lowPriority.has('matched')).thenReturn(false);
      });

      it(`returns null`, async () => {
        const value = this.props.get('matched');
        expect(value).toBeNull();
      });
    });
  });

  describe(`.get() with default value`, () => {
    describe(`on key that matches all priorities`, () => {
      beforeEach(() => {
        when(this.highPriority.has('a')).thenReturn(true);
        when(this.highPriority.get('a')).thenReturn('value from high priority');
        when(this.middlePriority.has('a')).thenReturn(true);
        when(this.middlePriority.get('a')).thenReturn('value from middle priority');
        when(this.lowPriority.has('a')).thenReturn(true);
        when(this.lowPriority.get('a')).thenReturn('value from low priority');
      });

      it(`returns the value of the highest`, async () => {
        const value = this.props.get('a', 'default');
        expect(value).toEqual('value from high priority');
      });
    });

    describe(`on key that matches all priorities but return null`, () => {
      beforeEach(() => {
        when(this.highPriority.has('a')).thenReturn(true);
        when(this.highPriority.get('a')).thenReturn(null);
        when(this.middlePriority.has('a')).thenReturn(true);
        when(this.middlePriority.get('a')).thenReturn(null);
        when(this.lowPriority.has('a')).thenReturn(true);
        when(this.lowPriority.get('a')).thenReturn(null);
      });

      it(`returns the value of the highest`, async () => {
        const value = this.props.get('a', 'default');
        expect(value).toEqual('default');
      });
    });

    describe(`on key that matches middle and low priorities`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(true);
        when(this.middlePriority.get('matched')).thenReturn('value from middle priority');
        when(this.lowPriority.has('matched')).thenReturn(true);
        when(this.lowPriority.get('matched')).thenReturn('value from low priority');
      });

      it(`returns the value of the middle`, async () => {
        const value = this.props.get('matched', 'default');
        expect(value).toEqual('value from middle priority');
      });
    });

    describe(`on key that matches middle and low priorities but return null`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(true);
        when(this.middlePriority.get('matched')).thenReturn(null);
        when(this.lowPriority.has('matched')).thenReturn(true);
        when(this.lowPriority.get('matched')).thenReturn(null);
      });

      it(`returns the value of the middle`, async () => {
        const value = this.props.get('matched', 'default');
        expect(value).toEqual('default');
      });
    });

    describe(`on key that matches low priority`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(false);
        when(this.lowPriority.has('matched')).thenReturn(true);
        when(this.lowPriority.get('matched')).thenReturn('value from low priority');
      });

      it(`returns the value of the low`, async () => {
        const value = this.props.get('matched', 'default');
        expect(value).toEqual('value from low priority');
      });
    });

    describe(`on key that matches low priority but return null`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(false);
        when(this.lowPriority.has('matched')).thenReturn(true);
        when(this.lowPriority.get('matched')).thenReturn(null);
      });

      it(`returns the value of the low`, async () => {
        const value = this.props.get('matched', 'default');
        expect(value).toEqual('default');
      });
    });

    describe(`on key that matches none`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(false);
        when(this.lowPriority.has('matched')).thenReturn(false);
      });

      it(`returns default`, async () => {
        const value = this.props.get('matched', 'default');
        expect(value).toEqual('default');
      });
    });
  });

  describe(`.getOrThrow()`, () => {
    describe(`on key that matches all priorities`, () => {
      beforeEach(() => {
        when(this.highPriority.has('a')).thenReturn(true);
        when(this.highPriority.get('a')).thenReturn('value from high priority');
        when(this.middlePriority.has('a')).thenReturn(true);
        when(this.middlePriority.get('a')).thenReturn('value from middle priority');
        when(this.lowPriority.has('a')).thenReturn(true);
        when(this.lowPriority.get('a')).thenReturn('value from low priority');
      });

      it(`returns the value of the highest`, async () => {
        const value = this.props.getOrThrow('a');
        expect(value).toEqual('value from high priority');
      });
    });

    describe(`on key that matches middle and low priorities`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(true);
        when(this.middlePriority.get('matched')).thenReturn('value from middle priority');
        when(this.lowPriority.has('matched')).thenReturn(true);
        when(this.lowPriority.get('matched')).thenReturn('value from low priority');
      });

      it(`returns the value of the middle`, async () => {
        const value = this.props.getOrThrow('matched');
        expect(value).toEqual('value from middle priority');
      });
    });

    describe(`on key that matches low priority`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(false);
        when(this.lowPriority.has('matched')).thenReturn(true);
        when(this.lowPriority.get('matched')).thenReturn('value from low priority');
      });

      it(`returns the value of the low`, async () => {
        const value = this.props.getOrThrow('matched');
        expect(value).toEqual('value from low priority');
      });
    });

    describe(`on key that matches none`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(false);
        when(this.lowPriority.has('matched')).thenReturn(false);
      });

      it(`fails indicating that property is missing`, async () => {
        expect(() => {
          this.props.getOrThrow('matched');
        }).toThrowError(MissingConfigurationProperty, `The key 'matched' is not defined`);
      });
    });

    describe(`on key that matches one but returns null`, () => {
      beforeEach(() => {
        when(this.highPriority.has('matched')).thenReturn(false);
        when(this.middlePriority.has('matched')).thenReturn(false);
        when(this.lowPriority.has('matched')).thenReturn(true);
        when(this.lowPriority.get('matched')).thenReturn(null);
      });

      it(`fails indicating that property value is missing`, async () => {
        expect(() => {
          this.props.getOrThrow('matched');
        }).toThrowError(
          MissingConfigurationProperty,
          `The key 'matched' is defined but the value is undefined or null`
        );
      });
    });
  });
});
