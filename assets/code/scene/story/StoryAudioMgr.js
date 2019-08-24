module.exports = {

    _allEffectID: [],
    cleanAudioEffect() {
        cc.audioEngine.stopAllEffects();
    },
    stopAll() {
        cc.audioEngine.stopMusic();
        cc.audioEngine.stopAllEffects();
    },
    stopMusic() {
        cc.audioEngine.stopMusic();
    },
    playEffect(clip, loop) {
        let id = cc.audioEngine.playEffect(clip, loop);
        this._allEffectID.push(id);
    },
    playMusic(clip, loop) {
        cc.audioEngine.playMusic(clip, loop);
    },
}
