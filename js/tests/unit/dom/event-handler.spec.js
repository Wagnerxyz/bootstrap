import EventHandler from '../../../src/dom/event-handler'
import { getFixture, clearFixture } from '../../helpers/fixture'

describe('EventHandler', () => {
  let fixtureEl

  beforeAll(() => {
    fixtureEl = getFixture()
  })

  afterEach(() => {
    clearFixture()
  })

  describe('on', () => {
    it('should not add event listener if the event is not a string', () => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      EventHandler.on(div, null, () => {})
      EventHandler.on(null, 'click', () => {})

      expect().nothing()
    })

    it('should add event listener', done => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      EventHandler.on(div, 'click', () => {
        expect().nothing()
        done()
      })

      div.click()
    })

    it('should add namespaced event listener', done => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      EventHandler.on(div, 'bs.namespace', () => {
        expect().nothing()
        done()
      })

      EventHandler.trigger(div, 'bs.namespace')
    })

    it('should add native namespaced event listener', done => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')

      EventHandler.on(div, 'click.namespace', () => {
        expect().nothing()
        done()
      })

      EventHandler.trigger(div, 'click')
    })

    it('should handle event delegation', done => {
      EventHandler.on(document, 'click', '.test', () => {
        expect().nothing()
        done()
      })

      fixtureEl.innerHTML = '<div class="test"></div>'

      const div = fixtureEl.querySelector('div')

      div.click()
    })

    it('should handle mouseenter/mouseleave like the native counterpart', done => {
      fixtureEl.innerHTML = [
        '<div class="outer">',
        '<div class="inner">',
        '<div class="nested">',
        '<div class="deep"></div>',
        '</div>',
        '</div>',
        '<div class="sibling"></div>',
        '</div>'
      ]

      const outer = fixtureEl.querySelector('.outer')
      const inner = fixtureEl.querySelector('.inner')
      const nested = fixtureEl.querySelector('.nested')
      const deep = fixtureEl.querySelector('.deep')
      const sibling = fixtureEl.querySelector('.sibling')

      const enterSpy = jasmine.createSpy('mouseenter')
      const leaveSpy = jasmine.createSpy('mouseleave')
      const delegateEnterSpy = jasmine.createSpy('mouseenter')
      const delegateLeaveSpy = jasmine.createSpy('mouseleave')

      EventHandler.on(inner, 'mouseenter', enterSpy)
      EventHandler.on(inner, 'mouseleave', leaveSpy)
      EventHandler.on(outer, 'mouseenter', '.inner', delegateEnterSpy)
      EventHandler.on(outer, 'mouseleave', '.inner', delegateLeaveSpy)

      EventHandler.on(sibling, 'mouseenter', () => {
        expect(enterSpy.calls.count()).toBe(2)
        expect(leaveSpy.calls.count()).toBe(2)
        expect(delegateEnterSpy.calls.count()).toBe(2)
        expect(delegateLeaveSpy.calls.count()).toBe(2)
        done()
      })

      const moveMouse = (from, to) => {
        from.dispatchEvent(new MouseEvent('mouseout', {
          bubbles: true,
          relatedTarget: to
        }))

        to.dispatchEvent(new MouseEvent('mouseover', {
          bubbles: true,
          relatedTarget: from
        }))
      }

      // from outer to deep and back to outer (nested)
      moveMouse(outer, inner)
      moveMouse(inner, nested)
      moveMouse(nested, deep)
      moveMouse(deep, nested)
      moveMouse(nested, inner)
      moveMouse(inner, outer)

      setTimeout(() => {
        expect(enterSpy.calls.count()).toBe(1)
        expect(leaveSpy.calls.count()).toBe(1)
        expect(delegateEnterSpy.calls.count()).toBe(1)
        expect(delegateLeaveSpy.calls.count()).toBe(1)

        // from outer to inner to sibling (adjacent)
        moveMouse(outer, inner)
        moveMouse(inner, sibling)
      }, 20)
    })
  })

  describe('one', () => {
    it('should call listener just once', done => {
      fixtureEl.innerHTML = '<div></div>'

      let called = 0
      const div = fixtureEl.querySelector('div')
      const obj = {
        oneListener() {
          called++
        }
      }

      EventHandler.one(div, 'bootstrap', obj.oneListener)

      EventHandler.trigger(div, 'bootstrap')
      EventHandler.trigger(div, 'bootstrap')

      setTimeout(() => {
        expect(called).toBe(1)
        done()
      }, 20)
    })

    it('should call delegated listener just once', done => {
      fixtureEl.innerHTML = '<div></div>'

      let called = 0
      const div = fixtureEl.querySelector('div')
      const obj = {
        oneListener() {
          called++
        }
      }

      EventHandler.one(fixtureEl, 'bootstrap', 'div', obj.oneListener)

      EventHandler.trigger(div, 'bootstrap')
      EventHandler.trigger(div, 'bootstrap')

      setTimeout(() => {
        expect(called).toBe(1)
        done()
      }, 20)
    })
  })

  describe('off', () => {
    it('should not remove a listener', () => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      EventHandler.off(div, null, () => {})
      EventHandler.off(null, 'click', () => {})
      expect().nothing()
    })

    it('should remove a listener', done => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      let called = 0
      const handler = () => {
        called++
      }

      EventHandler.on(div, 'foobar', handler)
      EventHandler.trigger(div, 'foobar')

      EventHandler.off(div, 'foobar', handler)
      EventHandler.trigger(div, 'foobar')

      setTimeout(() => {
        expect(called).toBe(1)
        done()
      }, 20)
    })

    it('should remove all the events', done => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      let called = 0

      EventHandler.on(div, 'foobar', () => {
        called++
      })
      EventHandler.on(div, 'foobar', () => {
        called++
      })
      EventHandler.trigger(div, 'foobar')

      EventHandler.off(div, 'foobar')
      EventHandler.trigger(div, 'foobar')

      setTimeout(() => {
        expect(called).toBe(2)
        done()
      }, 20)
    })

    it('should remove all the namespaced listeners if namespace is passed', done => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      let called = 0

      EventHandler.on(div, 'foobar.namespace', () => {
        called++
      })
      EventHandler.on(div, 'foofoo.namespace', () => {
        called++
      })
      EventHandler.trigger(div, 'foobar.namespace')
      EventHandler.trigger(div, 'foofoo.namespace')

      EventHandler.off(div, '.namespace')
      EventHandler.trigger(div, 'foobar.namespace')
      EventHandler.trigger(div, 'foofoo.namespace')

      setTimeout(() => {
        expect(called).toBe(2)
        done()
      }, 20)
    })

    it('should remove the namespaced listeners', done => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      let calledCallback1 = 0
      let calledCallback2 = 0

      EventHandler.on(div, 'foobar.namespace', () => {
        calledCallback1++
      })
      EventHandler.on(div, 'foofoo.namespace', () => {
        calledCallback2++
      })

      EventHandler.trigger(div, 'foobar.namespace')
      EventHandler.off(div, 'foobar.namespace')
      EventHandler.trigger(div, 'foobar.namespace')

      EventHandler.trigger(div, 'foofoo.namespace')

      setTimeout(() => {
        expect(calledCallback1).toBe(1)
        expect(calledCallback2).toBe(1)
        done()
      }, 20)
    })

    it('should remove the all the namespaced listeners for native events', done => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      let called = 0

      EventHandler.on(div, 'click.namespace', () => {
        called++
      })
      EventHandler.on(div, 'click.namespace2', () => {
        called++
      })

      EventHandler.trigger(div, 'click')
      EventHandler.off(div, 'click')
      EventHandler.trigger(div, 'click')

      setTimeout(() => {
        expect(called).toBe(2)
        done()
      }, 20)
    })

    it('should remove the specified namespaced listeners for native events', done => {
      fixtureEl.innerHTML = '<div></div>'
      const div = fixtureEl.querySelector('div')

      let called1 = 0
      let called2 = 0

      EventHandler.on(div, 'click.namespace', () => {
        called1++
      })
      EventHandler.on(div, 'click.namespace2', () => {
        called2++
      })
      EventHandler.trigger(div, 'click')

      EventHandler.off(div, 'click.namespace')
      EventHandler.trigger(div, 'click')

      setTimeout(() => {
        expect(called1).toBe(1)
        expect(called2).toBe(2)
        done()
      }, 20)
    })

    it('should remove a listener registered by .one', done => {
      fixtureEl.innerHTML = '<div></div>'

      const div = fixtureEl.querySelector('div')
      const handler = () => {
        throw new Error('called')
      }

      EventHandler.one(div, 'foobar', handler)
      EventHandler.off(div, 'foobar', handler)

      EventHandler.trigger(div, 'foobar')
      setTimeout(() => {
        expect().nothing()
        done()
      }, 20)
    })

    it('should remove the correct delegated event listener', () => {
      const element = document.createElement('div')
      const subelement = document.createElement('span')
      element.append(subelement)

      const anchor = document.createElement('a')
      element.append(anchor)

      let i = 0
      const handler = () => {
        i++
      }

      EventHandler.on(element, 'click', 'a', handler)
      EventHandler.on(element, 'click', 'span', handler)

      fixtureEl.append(element)

      EventHandler.trigger(anchor, 'click')
      EventHandler.trigger(subelement, 'click')

      // first listeners called
      expect(i).toBe(2)

      EventHandler.off(element, 'click', 'span', handler)
      EventHandler.trigger(subelement, 'click')

      // removed listener not called
      expect(i).toBe(2)

      EventHandler.trigger(anchor, 'click')

      // not removed listener called
      expect(i).toBe(3)

      EventHandler.on(element, 'click', 'span', handler)
      EventHandler.trigger(anchor, 'click')
      EventHandler.trigger(subelement, 'click')

      // listener re-registered
      expect(i).toBe(5)

      EventHandler.off(element, 'click', 'span')
      EventHandler.trigger(subelement, 'click')

      // listener removed again
      expect(i).toBe(5)
    })
  })
})
