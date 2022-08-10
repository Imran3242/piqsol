const mapingNewSettings = (oldSettings: any, newSettings: any): any => {
  newSettings.forEach((setting: any) => {
    const alreadyExists = oldSettings.find(
      (oldSetting: any) => oldSetting.title === setting.title
    );
    if (!alreadyExists) {
      oldSettings.push(setting);
    }
  });

  if (oldSettings.length === newSettings.length) return oldSettings;

  const updatedDefaultSettings: any = [];
  oldSettings.forEach((setting: any) => {
    const alreadyExists = newSettings.find(
      (newSetting: any) => newSetting.title === setting.title
    );
    if (alreadyExists) {
      updatedDefaultSettings.push(setting);
    }
  });

  if (updatedDefaultSettings.length === newSettings.length)
    return updatedDefaultSettings;
};

export { mapingNewSettings };
