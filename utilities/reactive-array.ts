
class ReactiveArray<T> extends Array<T> {}
const mutativeMethods =
  ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'copyWithin', 'fill']
for (const method of mutativeMethods)
  ReactiveArray.prototype[method as any] =
    function(...args: unknown[]) {
      this[method as any](...args)

    }



// return an array that triggers a Subscribable which is also returned
// We must extend array to trigger the returned subscribable

// overwrite all mutative methods to alert stream to changes


// Perhaps a single reactive array implementation is not good
// Or maybe it is. Maybe I can implement Array of streams still.
// maybe this isn't a problem,

// Maybe I don't want reactive array.
// Maybe I want array of streams


// ------------------------------------------ //

// Map of transcript items which iterates in insertion order
// Every transcript object has a stream which pings on change

type ItemId = string
type TranscriptItem = {
  role: 'assistant' | 'user'
  text: Subscribable.Pushable<string>
}
const transcript = new Map<ItemId, TranscriptItem>




// I'm not even using a fucking array!
// Pay attention!

// TranscriptItem contains a Reactive string!
// I don't want to subtype string
// I want suffixes pushed to a Pushable

// Not Pushable?
// Alternately,
// The Subscribable knows how to subscribe to updates

// I want a split method as alternative to filter.

// split the deltas received based on item_id
