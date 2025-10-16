import { GenderEnum, KeyRegex } from '@/models/common';
import { IScopedUser } from '@/models/ModelPage';

class StringUtilities {
  regexText(text: string, user?: IScopedUser) {
    let newText = text;

    if (text.includes(KeyRegex.USER_FULL_NAME)) {
      newText = newText.replaceAll(KeyRegex.USER_FULL_NAME, user?.name ?? '');
    }

    if (text.includes('@hotenkhachhang')) {
      newText = newText.replaceAll('@hotenkhachhang', user?.name ?? '');
    }

    if (text.includes(KeyRegex.PSID)) {
      newText = newText.replaceAll(KeyRegex.PSID, user?.scopedUserId ?? '');
    }

    return newText
      .replaceAll(/#SEX{{(.*?)}}/g, (_, options) =>
        this.replaceGenderText(options, user),
      )
      .replaceAll(/@sex\((.*?)\)/g, (_, options) =>
        this.replaceGenderText(options, user),
      )
      .replaceAll(/#{(.*?)}/g, (_, options) => this.replaceSpinText(options));
  }

  replaceGenderText = (options: string, user?: IScopedUser): string => {
    const [maleValue = '', femaleValue = '', unknownValue = ''] = options
      .split('|')
      .map((opt) => opt.trim());
    const gender = user?.gender;

    if (gender === GenderEnum.MALE) {
      return maleValue;
    } else if (gender === GenderEnum.FEMALE) {
      return femaleValue;
    } else {
      return unknownValue;
    }
  };

  replaceSpinText = (options: string): string => {
    const values = options.split('|').map((opt) => opt.trim());
    return values[Math.floor(Math.random() * values.length)];
  };
}

export default new StringUtilities();
